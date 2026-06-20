import type { PrintModeEvent } from '@savant-code/common/types/print-mode'

import type { StreamEvent } from '../types/stream-events'

/**
 * Maps an SDK `PrintModeEvent` to one or more `StreamEvent`s.
 *
 * FID-2026-0620-007 — the v0.1+ TODO from FID-006. Each PrintModeEvent
 * type maps to a corresponding StreamEvent type:
 *
 * - `start`              → `session.start`
 * - `text`               → `message.assistant` (chunked; id shared per call)
 * - `reasoning_delta`    → `message.reasoning` (chunked; id shared per agent)
 * - `tool_call`          → `tool.call`
 * - `tool_result`        → `tool.result`
 * - `error`              → `error`
 * - `finish`             → `session.end` with usage (when present)
 * - `download`           → suppressed (internal NuGet-style; not user-relevant)
 * - `subagent_start`     → suppressed for v0.1; defer subagent events to v0.3
 * - `subagent_finish`    → suppressed for v0.1
 *
 * The mapper is PURE — no side effects, no I/O. The caller is responsible
 * for calling `emitter.emit()` for each returned event.
 */
export function mapPrintModeToStream(
  event: PrintModeEvent,
  context: MapPrintModeContext,
): StreamEvent[] {
  const ts = Date.now()
  const v = 1 as const

  switch (event.type) {
    case 'start': {
      const sessionId = context.sessionId
      const agent = event.agentId ?? context.defaultAgent
      const model = context.model
      return [
        { v, type: 'session.start', sessionId, agent, model, ts },
      ]
    }

    case 'text': {
      // Each `text` event is a single block; use a fresh id per call so
      // consumers see one logical message per text block. The counter
      // is per (kind, agentId) so concurrent sub-agents don't collide.
      const id = context.nextMessageId('assistant')
      // Emit one delta + one done. Consumers reassemble by concatenating
      // deltas sharing the same id.
      return [
        { v, type: 'message.assistant', id, delta: event.text, ts },
        { v, type: 'message.assistant.done', id, ts: ts + 1 },
      ]
    }

    case 'reasoning_delta': {
      // Use runId (unique per agent run) so multiple deltas within the
      // same run share an id — consumers reassemble by id.
      return [
        { v, type: 'message.reasoning', id: event.runId, delta: event.text, ts },
      ]
    }

    case 'tool_call': {
      return [
        {
          v,
          type: 'tool.call',
          id: event.toolCallId,
          name: event.toolName,
          args: event.input,
          ts,
        },
      ]
    }

    case 'tool_result': {
      // toolResultOutputSchema is a complex union; serialize to JSON
      // for the stream. Consumers can reconstruct if needed.
      return [
        {
          v,
          type: 'tool.result',
          id: event.toolCallId,
          name: event.toolName,
          result: event.output,
          ts,
        },
      ]
    }

    case 'error': {
      return [
        { v, type: 'error', message: event.message, ts },
      ]
    }

    case 'finish': {
      return [
        {
          v,
          type: 'session.end',
          reason: 'complete',
          // totalCost is dollars, not token counts. Until we have
          // separate input/output token counts, we omit `usage` here
          // (could be added once agent-runtime exposes them).
          ts,
        },
      ]
    }

    case 'download':
    case 'subagent_start':
    case 'subagent_finish':
      // Suppressed for v0.1
      return []
  }
}

/**
 * Context for the mapper. Holds stable state (session id, model) and a
 * factory for message ids so the caller can correlate deltas with
 * their parent message.
 */
export interface MapPrintModeContext {
  sessionId: string
  model: string
  defaultAgent: string
  /** Per-(kind, optional agentId) counter for stable message ids. */
  nextMessageId: (kind: 'assistant' | 'reasoning', agentId?: string) => string
}

/**
 * Factory: create a `MapPrintModeContext` for a new session.
 */
export function createMapPrintModeContext(options: {
  sessionId: string
  model: string
  defaultAgent: string
}): MapPrintModeContext {
  const counters = new Map<string, number>()
  return {
    sessionId: options.sessionId,
    model: options.model,
    defaultAgent: options.defaultAgent,
    nextMessageId: (kind, agentId) => {
      const key = `${kind}:${agentId ?? '_'}`
      const next = (counters.get(key) ?? 0) + 1
      counters.set(key, next)
      return `${key}#${next}`
    },
  }
}
