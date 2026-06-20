import {
  DEFAULT_COMPACTION_THRESHOLD,
  getModelContextWindow,
} from '@savant-code/common/constants/model-context-windows'

import { countTokens } from './token-counter'

/**
 * Auto-compaction for the agent loop (FID-2026-0620-010).
 *
 * Two pure functions plus a stateful compactor:
 * - `shouldCompact(messages, modelId, threshold?)` — returns true if the
 *   conversation is at or above the threshold of the model's context window.
 *   Pure (no I/O). Reuses `countTokens` from `token-counter.ts` (cached).
 * - `compactMessages(messages, options)` — replaces the oldest N messages
 *   with a single summary. Calls an LLM (the agent's LLM) to summarize;
 *   same approach as the existing manual `/compact` command.
 * - `applyCompaction(state, summary)` — pure reducer that swaps the
 *   message history in the agent state.
 *
 * Design decisions (per FID-010 Q15-Q20):
 * - Q15: threshold = 80% (configurable)
 * - Q16: LLM-driven distillation (one extra API call per compaction)
 * - Q17: compact messages only (not tool results)
 * - Q18: in-memory only (no SQLite in v0.1; persist in v0.2)
 * - Q19: system prompt never compacted
 * - Q20: char-based estimation via `countTokens` (cached, accurate)
 */

import type { Message } from '@savant-code/common/types/messages/savant-code-message'
import type { Logger } from '@savant-code/common/types/contracts/logger'

// Re-export so consumers don't need a second import.
export { getModelContextWindow, DEFAULT_COMPACTION_THRESHOLD }

// ============================================================================
// shouldCompact
// ============================================================================

/**
 * Estimate the total token count of the message history.
 *
 * @param messages - the agent's message history
 * @returns estimated total tokens (uses cached `countTokens` per message)
 */
export function estimateMessageTokens(messages: ReadonlyArray<Message>): number {
  let total = 0
  for (const msg of messages) {
    // Tokenize the JSON-serialized message. Slightly over-counts (includes
    // role names, tool call JSON scaffolding) but is consistent.
    total += countTokens(JSON.stringify(msg))
  }
  return total
}

/**
 * Pure predicate: should the agent auto-compact the conversation now?
 *
 * @param messages - current message history
 * @param modelId - the model in use (e.g., 'claude-sonnet-4.6')
 * @param threshold - fraction of model context window to trigger at (default 0.8)
 * @returns true if the conversation is at or above the threshold
 */
export function shouldCompact(
  messages: ReadonlyArray<Message>,
  modelId: string | null | undefined,
  threshold: number = DEFAULT_COMPACTION_THRESHOLD,
): boolean {
  if (messages.length === 0) return false
  const contextWindow = getModelContextWindow(modelId)
  const triggerAt = Math.floor(contextWindow * threshold)
  const current = estimateMessageTokens(messages)
  return current >= triggerAt
}

// ============================================================================
// compactMessages
// ============================================================================

/**
 * Options for `compactMessages`.
 */
export interface CompactMessagesOptions {
  /** The LLM call function. Receives the compactPrompt + oldest N messages,
   *  returns a single summary string. Same signature as `runAgentStep`'s
   *  `promptAiSdk` (or a subset thereof). */
  summarize: (params: { systemPrompt: string; messages: Message[] }) => Promise<string>
  /** The system prompt asking the LLM to summarize. Defaults to a generic
   *  "summarize this conversation" prompt. */
  systemPrompt?: string
  /** Fraction of messages to compact (from the start). Default 0.6 = first 60%. */
  fractionToCompact?: number
  /** Logger for diagnostics. */
  logger?: Logger
}

/**
 * Default system prompt for the LLM when summarizing.
 *
 * FID-010 Q16: LLM-driven distillation. The summary should be structured
 * to preserve:
 *   - Decisions the user/agent made
 *   - Open questions
 *   - Todos
 *
 * (The system prompt for the regular /compact command is more detailed; for
 * auto-compact we use a tighter prompt to save tokens on the summary call
 * itself.)
 */
export const DEFAULT_COMPACT_SYSTEM_PROMPT = `You are a conversation summarizer. Produce a structured summary of the conversation provided, preserving:
1. **Decisions** made by the user or the assistant (each with brief context)
2. **Open questions** that are still unresolved
3. **Active todos** (in progress or pending)
4. **Context** (key file paths, function/class names, decisions that will matter for next steps)

Output ONLY the summary, no preamble. Use bullet lists. Be concise but preserve any code identifiers verbatim.`

/**
 * Compact a message history by replacing the oldest N messages with a single
 * summary produced by the LLM.
 *
 * The system prompt (which is a separate field on the agent state) is NEVER
 * compacted. Tool result messages are NEVER compacted (per Q17).
 *
 * @returns the new message history, ready to be assigned to agent state.
 */
export async function compactMessages(
  messages: ReadonlyArray<Message>,
  options: CompactMessagesOptions,
): Promise<Message[]> {
  const {
    summarize,
    systemPrompt = DEFAULT_COMPACT_SYSTEM_PROMPT,
    fractionToCompact = 0.6,
    logger,
  } = options

  // Separate compactable messages (user/assistant) from preserve messages
  // (system, tool results).
  const compactableIndices: number[] = []
  for (let i = 0; i < messages.length; i++) {
    const role = (messages[i] as { role?: string }).role
    if (role === 'user' || role === 'assistant') {
      compactableIndices.push(i)
    }
  }

  if (compactableIndices.length < 2) {
    // Not enough user/assistant messages to compact meaningfully.
    if (logger) {
      logger.debug(
        { compactable: compactableIndices.length },
        'Skipping compaction: not enough user/assistant messages',
      )
    }
    return [...messages]
  }

  const splitIndex = Math.max(
    1,
    Math.floor(compactableIndices.length * fractionToCompact),
  )
  const toCompact = compactableIndices
    .slice(0, splitIndex)
    .map((i) => messages[i])

  if (logger) {
    logger.debug(
      { compacting: toCompact.length, keeping: messages.length - toCompact.length },
      'Auto-compaction: summarizing oldest messages',
    )
  }

  let summary: string
  try {
    summary = await summarize({ systemPrompt, messages: toCompact })
  } catch (err) {
    // Compaction failed — keep going with the original messages. Better
    // to risk exceeding the window than to crash the session.
    if (logger) {
      logger.warn(
        { err: err instanceof Error ? err.message : String(err) },
        'Auto-compaction failed; continuing with original messages',
      )
    }
    return [...messages]
  }

  // Build the new message history:
  //   preserved (system, tool) + summary (wrapped as user) + remaining compactable
  // toCompact messages are SKIPPED (replaced by the summary).
  const preserved: Message[] = []
  const remaining: Message[] = []
  const toCompactSet = new Set(toCompact)
  const compactableSet = new Set(compactableIndices.map((i) => messages[i]))
  for (const msg of messages) {
    if (toCompactSet.has(msg)) continue // replaced by summary
    if (compactableSet.has(msg)) {
      remaining.push(msg)
    } else {
      preserved.push(msg)
    }
  }

  // The summary is wrapped as a user message (so the LLM sees it as context).
  const summaryMessage: Message = {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `[Conversation summary, auto-generated]\n\n${summary}`,
      },
    ],
  } as unknown as Message

  return [...preserved, summaryMessage, ...remaining]
}

// ============================================================================
// applyCompaction
// ============================================================================

/**
 * Reduce agent state by replacing its message history. Pure.
 *
 * @param state - current agent state (must have `messageHistory: Message[]`)
 * @param newHistory - replacement message history (from `compactMessages`)
 * @returns a new state object with the updated history. Original is not mutated.
 */
export function applyCompaction<T extends { messageHistory: Message[] }>(
  state: T,
  newHistory: Message[],
): T {
  return { ...state, messageHistory: newHistory }
}
