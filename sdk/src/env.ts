/**
 * SDK environment helper for dependency injection.
 *
 * This module provides SDK-specific env helpers that extend the base
 * process env with SDK-specific vars for binary paths and WASM.
 */

import {
  BYOK_OPENROUTER_ENV_VAR,
  OPENROUTER_API_KEY_ENV_VAR,
} from '@savant-code/common/constants/byok'
import { CHATGPT_OAUTH_TOKEN_ENV_VAR } from '@savant-code/common/constants/chatgpt-oauth'
import { API_KEY_ENV_VAR } from '@savant-code/common/constants/paths'
import { getBaseEnv } from '@savant-code/common/env-process'

import type { SdkEnv } from './types/env'

/**
 * Get SDK environment values.
 * Composes from getBaseEnv() + SDK-specific vars.
 */
export const getSdkEnv = (): SdkEnv => ({
  ...getBaseEnv(),

  // SDK-specific paths
  SAVANT_CODE_RG_PATH: process.env.SAVANT_CODE_RG_PATH,
  SAVANT_CODE_WASM_DIR: process.env.SAVANT_CODE_WASM_DIR,

  // Build flags
  VERBOSE: process.env.VERBOSE,
  OVERRIDE_TARGET: process.env.OVERRIDE_TARGET,
  OVERRIDE_PLATFORM: process.env.OVERRIDE_PLATFORM,
  OVERRIDE_ARCH: process.env.OVERRIDE_ARCH,
})

export const getSavantCodeApiKeyFromEnv = (): string | undefined => {
  return process.env[API_KEY_ENV_VAR]
}

export const getSystemProcessEnv = (): NodeJS.ProcessEnv => {
  return process.env
}

export const getByokOpenrouterApiKeyFromEnv = (): string | undefined => {
  // Primary: the conventional OPENROUTER_API_KEY env var (added 2026-06-20 per
  // user feedback — "savant is not an api provider, savant is the consumer").
  // Fallback: the legacy SAVANT_CODE_BYOK_OPENROUTER for users with existing setup.
  return (
    process.env[OPENROUTER_API_KEY_ENV_VAR] ??
    process.env[BYOK_OPENROUTER_ENV_VAR]
  )
}

/**
 * Get ChatGPT OAuth token from environment variable.
 */
export const getChatGptOAuthTokenFromEnv = (): string | undefined => {
  return process.env[CHATGPT_OAUTH_TOKEN_ENV_VAR]
}
