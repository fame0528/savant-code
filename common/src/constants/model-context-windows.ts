/**
 * Model context window sizes (tokens) — used by auto-compaction
 * (FID-2026-0620-010) to decide when the conversation is approaching
 * the model's limit and needs to be summarized.
 *
 * Values are conservative — the agent-runtime applies a safety
 * threshold (default 80%) on top of these numbers.
 *
 * To add a new model: append a row here. The lookup is case-insensitive
 * and supports partial match against `modelId` (e.g., 'claude-sonnet-4.6'
 * will match 'claude').
 */

/** Default context window for unknown models (200K = Claude 4 family). */
export const DEFAULT_MODEL_CONTEXT_WINDOW = 200_000

/**
 * Per-model context window sizes.
 *
 * Keyed by canonical model id (lowercased). Lookups in `getModelContextWindow`
 * use exact match first, then prefix match, then default.
 */
export const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  // Anthropic Claude 4 family
  'claude-opus-4.6': 200_000,
  'claude-sonnet-4.6': 200_000,
  'claude-haiku-4.6': 200_000,
  'claude-opus-4.5': 200_000,
  'claude-sonnet-4.5': 200_000,
  'claude-haiku-4.5': 200_000,
  'claude-opus-4': 200_000,
  'claude-sonnet-4': 200_000,
  'claude-haiku-4': 200_000,
  'claude': 200_000,

  // Anthropic Claude 3 family
  'claude-3-7-sonnet': 200_000,
  'claude-3-5-sonnet': 200_000,
  'claude-3-5-haiku': 200_000,
  'claude-3-opus': 200_000,
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,

  // OpenAI GPT-4 family
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-4': 8_192,
  'o1': 200_000,
  'o1-mini': 128_000,
  'o1-preview': 128_000,
  'o3': 200_000,
  'o3-mini': 200_000,

  // Google Gemini
  'gemini-1.5-pro': 1_000_000,
  'gemini-1.5-flash': 1_000_000,
  'gemini-2.0-flash': 1_000_000,

  // Savant-Code custom (savant-free variants)
  'savant-free-flash': 1_000_000,
  'savant-free-pro': 200_000,
}

/**
 * Resolve a model id to its context window size.
 *
 * Lookup order:
 * 1. Exact match (case-insensitive)
 * 2. Prefix match (case-insensitive) — longest prefix wins
 * 3. `DEFAULT_MODEL_CONTEXT_WINDOW` (200K) as fallback
 */
export function getModelContextWindow(modelId: string | null | undefined): number {
  if (!modelId) return DEFAULT_MODEL_CONTEXT_WINDOW
  const id = modelId.toLowerCase().trim()
  if (!id) return DEFAULT_MODEL_CONTEXT_WINDOW

  // 1. Exact match
  if (MODEL_CONTEXT_WINDOWS[id] !== undefined) {
    return MODEL_CONTEXT_WINDOWS[id]
  }

  // 2. Prefix match (longest prefix wins)
  let bestMatch: string | null = null
  let bestLen = 0
  for (const key of Object.keys(MODEL_CONTEXT_WINDOWS)) {
    if (id.startsWith(key) && key.length > bestLen) {
      bestMatch = key
      bestLen = key.length
    }
  }
  if (bestMatch) return MODEL_CONTEXT_WINDOWS[bestMatch]

  // 3. Default
  return DEFAULT_MODEL_CONTEXT_WINDOW
}

/**
 * Default safety threshold — only auto-compact when the conversation
 * uses more than this fraction of the model's context window.
 * 0.80 = 80% (matches opencode's default).
 */
export const DEFAULT_COMPACTION_THRESHOLD = 0.8
