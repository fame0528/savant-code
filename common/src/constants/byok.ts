// OpenRouter BYOK: the user provides their own OpenRouter key so upstream
// OpenRouter calls bill to their account. The header is sent to the
// Savant-Code backend, which forwards it upstream to OpenRouter.
//
// The conventional env var is `OPENROUTER_API_KEY`. The historical
// `SAVANT_CODE_BYOK_OPENROUTER` is kept as a deprecated alias for users
// who already have it set.
//
// Note: Savant-Code is a CONSUMER of LLM APIs, not a provider. The "SavantCode"
// string in the codebase (e.g. `provider: 'SavantCode'` in model-provider.ts)
// is an internal routing tag, not a model vendor. Real model providers are
// openrouter, anthropic, openai, google, x-ai, deepseek, mimo, minimax,
// moonshotai, opencode, and chatgpt (via the ChatGPT OAuth backend).

export const BYOK_OPENROUTER_HEADER = 'x-openrouter-api-key'

/** Primary env var. Conventional name. */
export const OPENROUTER_API_KEY_ENV_VAR = 'OPENROUTER_API_KEY'

/** @deprecated Kept for backward compat; use OPENROUTER_API_KEY instead. */
export const BYOK_OPENROUTER_ENV_VAR = 'SAVANT_CODE_BYOK_OPENROUTER'
