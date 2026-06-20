import { describe, expect, test } from 'bun:test'

import {
  DEFAULT_COMPACTION_THRESHOLD,
  applyCompaction,
  compactMessages,
  estimateMessageTokens,
  shouldCompact,
} from '../util/compaction'
import type { Message } from '@savant-code/common/types/messages/savant-code-message'

/** Build a minimal Message for testing. */
function msg(role: 'user' | 'assistant' | 'system' | 'tool', text: string, id = `m-${Math.random()}`): Message {
  return {
    role,
    id,
    content: [{ type: 'text', text }],
  } as unknown as Message
}

// Lorem Ipsum word bank. Used to build test data that tokenizes proportionally
// to character count (BPE-compresses repeated single chars like 'x'.repeat()
// to ~1 token, so we need varied English text).
const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua ut enim ad minim ' +
  'veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
  'commodo consequat duis aute irure dolor in reprehenderit in voluptate ' +
  'velit esse cillum dolore eu fugiat nulla pariatur excepteur sint ' +
  'occaecat cupidatat non proident sunt in culpa qui officia deserunt ' +
  'mollit anim id est laborum'
).split(' ')

/**
 * Build varied English text of approximately `chars` characters.
 *
 * IMPORTANT: gpt-tokenizer BPE-compresses single-char runs (e.g., 'x'.repeat(N))
 * to ~1-2 tokens regardless of length. Tests that need realistic token counts
 * must use varied content. ~4 chars/token for English text.
 */
function variedText(chars: number): string {
  const out: string[] = []
  let total = 0
  let i = 0
  while (total < chars) {
    const word = LOREM_WORDS[i % LOREM_WORDS.length]!
    out.push(word)
    total += word.length + 1 // word + space
    i++
  }
  return out.join(' ')
}

describe('shouldCompact (FID-2026-0620-010)', () => {
  test('empty messages → never compact', () => {
    expect(shouldCompact([], 'claude-sonnet-4.6')).toBe(false)
  })

  test('small messages → never compact', () => {
    const messages = [msg('user', 'hi'), msg('assistant', 'hello')]
    expect(shouldCompact(messages, 'claude-sonnet-4.6')).toBe(false)
  })

  test('large messages (above 80% of 200K) → should compact', () => {
    // 500K chars of varied text → ~125K raw tokens × 1.35 fudge = ~169K fudged tokens
    // 4 messages → ~676K fudged tokens, well above 80% of 200K (160K) trigger
    const big = variedText(500_000)
    const messages = [
      msg('user', big),
      msg('user', big),
      msg('user', big),
      msg('user', big),
    ]
    expect(shouldCompact(messages, 'claude-sonnet-4.6')).toBe(true)
  })

  test('default threshold is 0.8', () => {
    expect(DEFAULT_COMPACTION_THRESHOLD).toBe(0.8)
  })

  test('modelId with case differences resolves correctly', () => {
    const messages = [msg('user', 'small')]
    expect(shouldCompact(messages, 'CLAUDE-SONNET-4.6')).toBe(false)
    expect(shouldCompact(messages, 'Claude-Sonnet-4.6')).toBe(false)
  })

  test('unknown model uses default 200K context window', () => {
    const big = variedText(500_000)
    const messages = [msg('user', big), msg('user', big), msg('user', big), msg('user', big)]
    // Should use DEFAULT_MODEL_CONTEXT_WINDOW (200K) just like claude-sonnet
    expect(shouldCompact(messages, 'unknown-model-xyz')).toBe(true)
  })

  test('null/undefined modelId uses default', () => {
    const messages = [msg('user', 'hi')]
    expect(shouldCompact(messages, null)).toBe(false)
    expect(shouldCompact(messages, undefined)).toBe(false)
    expect(shouldCompact(messages, '')).toBe(false)
  })

  test('smaller model (gpt-4 = 8K) triggers earlier', () => {
    // 30K chars varied → ~7.5K raw × 1.35 = ~10K fudged tokens
    // 4 messages → ~40K fudged, well above 80% of 8K (6.4K) trigger
    const medium = variedText(30_000)
    const messages = [msg('user', medium), msg('user', medium), msg('user', medium), msg('user', medium)]
    expect(shouldCompact(messages, 'gpt-4')).toBe(true)
  })

  test('gemini-2.0-flash (1M context) has higher threshold', () => {
    // 200K chars varied → ~50K raw × 1.35 = ~67K fudged tokens per message
    // 4 messages → ~270K fudged < 80% of 1M (800K) → should NOT compact
    const big = variedText(200_000)
    const messages = [msg('user', big), msg('user', big), msg('user', big), msg('user', big)]
    expect(shouldCompact(messages, 'gemini-2.0-flash')).toBe(false)
  })

  test('custom threshold is respected', () => {
    // 20K chars varied → ~5K raw × 1.35 = ~6.7K fudged per message
    // 4 messages → ~27K fudged < 0.5 × 200K (100K) trigger → should NOT compact
    const medium = variedText(20_000)
    const messages = [msg('user', medium), msg('user', medium), msg('user', medium), msg('user', medium)]
    expect(shouldCompact(messages, 'claude-sonnet-4.6', 0.5)).toBe(false)
  })
})

describe('estimateMessageTokens', () => {
  test('returns 0 for empty list', () => {
    expect(estimateMessageTokens([])).toBe(0)
  })

  test('uses cached countTokens (deterministic on same input)', () => {
    const m1 = msg('user', 'hello world')
    const m2 = msg('user', 'hello world')
    // Same JSON serialization → same token count
    const t1 = estimateMessageTokens([m1])
    const t2 = estimateMessageTokens([m2])
    expect(t1).toBe(t2)
  })

  test('returns > 0 for non-empty messages', () => {
    const t = estimateMessageTokens([msg('user', 'hello')])
    expect(t).toBeGreaterThan(0)
  })
})

describe('compactMessages (FID-2026-0620-010)', () => {
  test('empty messages returns empty', async () => {
    const out = await compactMessages([], {
      summarize: async () => 'summary',
    })
    expect(out).toEqual([])
  })

  test('fewer than 2 compactable messages returns unchanged', async () => {
    const messages = [msg('user', 'hello')]
    const out = await compactMessages(messages, {
      summarize: async () => 'summary',
    })
    expect(out).toEqual(messages)
  })

  test('compacts oldest 60% of user/assistant messages', async () => {
    const messages = [
      msg('user', 'm1'),
      msg('assistant', 'm2'),
      msg('user', 'm3'),
      msg('assistant', 'm4'),
      msg('user', 'm5'),
    ]
    const summarize = async (params: { messages: Message[] }) => {
      // Return a summary referencing the compacted messages
      return `summary of ${params.messages.length} messages`
    }
    const out = await compactMessages(messages, { summarize, fractionToCompact: 0.6 })

    // Should have: original user/assistant messages that were NOT in the first 60% + 1 summary + preserved
    // First 60% of 4 user/assistant messages = 2.4 → floor to 2 → so 2 messages compacted, 3 stay
    // Wait — total compactable = 4 (m1, m2, m3, m4 are user/assistant, m5 is user too)
    // Actually all 5 are user/assistant. So 5 × 0.6 = 3 → compact first 3
    expect(out).toHaveLength(3) // 1 summary + 2 remaining
    expect(out[0].role).toBe('user') // summary is wrapped as user
    expect((out[0].content[0] as { text: string }).text).toContain('summary of 3 messages')
    expect(out[1]).toEqual(messages[3])
    expect(out[2]).toEqual(messages[4])
  })

  test('preserves system messages at the start', async () => {
    const system = msg('system', 'you are a helpful assistant')
    const messages = [
      system,
      msg('user', 'm1'),
      msg('assistant', 'm2'),
      msg('user', 'm3'),
    ]
    const summarize = async () => 'summary'
    const out = await compactMessages(messages, { summarize, fractionToCompact: 0.5 })
    // System message should be at the start
    expect(out[0]).toEqual(system)
  })

  test('skips compaction when summarize throws (per Q44 — fail safe)', async () => {
    const messages = [msg('user', 'm1'), msg('assistant', 'm2'), msg('user', 'm3')]
    const summarize = async () => {
      throw new Error('LLM unavailable')
    }
    const out = await compactMessages(messages, { summarize })
    // Should return the original messages unchanged
    expect(out).toEqual(messages)
  })

  test('uses custom system prompt when provided', async () => {
    const messages = [msg('user', 'a'), msg('assistant', 'b'), msg('user', 'c')]
    const customPrompt = 'CUSTOM PROMPT'
    let receivedPrompt = ''
    const summarize = async (params: { systemPrompt: string; messages: Message[] }) => {
      receivedPrompt = params.systemPrompt
      return 'summary'
    }
    await compactMessages(messages, { summarize, systemPrompt: customPrompt })
    expect(receivedPrompt).toBe(customPrompt)
  })
})

describe('applyCompaction (FID-2026-0620-010)', () => {
  test('returns a new state with replaced history', () => {
    const original = { messageHistory: [msg('user', 'a'), msg('assistant', 'b')], other: 'preserved' }
    const newHistory = [msg('user', 'summary')]
    const next = applyCompaction(original, newHistory)
    expect(next).not.toBe(original)
    expect(next.messageHistory).toEqual(newHistory)
    expect(next.other).toBe('preserved')
  })

  test('does not mutate the original state', () => {
    const original = { messageHistory: [msg('user', 'a')] }
    const originalRef = original.messageHistory
    const newHistory = [msg('user', 'b')]
    applyCompaction(original, newHistory)
    expect(original.messageHistory).toBe(originalRef)
    expect(original.messageHistory).toHaveLength(1)
  })
})
