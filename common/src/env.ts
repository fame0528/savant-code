import { clientEnvSchema, clientProcessEnv } from './env-schema'

// Per ECHO Law 14 (all error paths handled) + per user feedback (2026-06-20):
// "savant is not an api provider, savant is the consumer" — the CLI does not
// need the full NEXT_PUBLIC_* web-app config to start. We parse with .safeParse,
// warn on issues, and only treat the result as "missing" for direct-accessors
// (env.NEXT_PUBLIC_*). The web app's next.config.js still does its own strict
// validation; this module is the CLI's entry point.
//
// The strict throw was blocking the CLI from running for users who use
// OpenRouter directly (or any direct LLM provider) without a Savant-Code
// account, which is the natural use case for the open-source CLI.
const parsedEnv = clientEnvSchema.safeParse(clientProcessEnv)
if (!parsedEnv.success) {
  console.warn(
    '[env] Some NEXT_PUBLIC_* vars are missing — fine for direct LLM usage.',
    'Missing:',
    parsedEnv.error.issues
      .map((i) => i.path.join('.'))
      .filter((v, i, a) => a.indexOf(v) === i),
    '. See .env.example for documentation.',
  )
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : ({} as ReturnType<typeof clientEnvSchema.parse>)

// Only log environment in non-production (when set)
if (env.NEXT_PUBLIC_SC_ENVIRONMENT && env.NEXT_PUBLIC_SC_ENVIRONMENT !== 'prod') {
  console.log('Using environment:', env.NEXT_PUBLIC_SC_ENVIRONMENT)
}

// Derived environment constants for convenience.
// Default to false when NEXT_PUBLIC_SC_ENVIRONMENT is unset (CLI direct-mode).
const scEnv = env.NEXT_PUBLIC_SC_ENVIRONMENT
export const IS_DEV = scEnv === 'dev'
export const IS_TEST = scEnv === 'test'
export const IS_PROD = scEnv === 'prod'
export const IS_CI = process.env.SAVANT_CODE_GITHUB_ACTIONS === 'true'

// Debug flag for logging analytics events in dev mode
// Set to true when actively debugging analytics - affects both CLI and backend
export const DEBUG_ANALYTICS = false
