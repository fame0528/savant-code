import { env, IS_DEV, IS_TEST, IS_PROD } from '@savant-code/common/env'

export { IS_DEV, IS_TEST, IS_PROD }

export const SAVANT_CODE_BINARY = 'SavantCode'

// Hardcoded fallback so direct-mode CLI users (no NEXT_PUBLIC_SAVANT_CODE_APP_URL)
// don't crash with "URL cannot be parsed". Actual requests will fail at network
// time with a clear error, which the CLI can handle gracefully (e.g., the user
// details TanStack Query will return an error and the TUI shows an empty
// avatar). Direct-mode users don't need the backend at all — the URL only
// needs to be syntactically valid.
export const WEBSITE_URL =
  env.NEXT_PUBLIC_SAVANT_CODE_APP_URL ?? 'https://savant-code.dev'
