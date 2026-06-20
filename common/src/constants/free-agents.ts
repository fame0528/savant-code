import { parseAgentId } from '../util/agent-id-parsing'

import { SAVANT_FREE_GEMINI_THINKER_AGENT_ID } from './savant-free-gemini-thinker'
import {
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  SAVANT_FREE_GEMINI_PRO_MODEL_ID,
  SAVANT_FREE_KIMI_MODEL_ID,
  SAVANT_FREE_MINIMAX_MODEL_ID,
  SAVANT_FREE_MINIMAX_M3_MODEL_ID,
  SAVANT_FREE_MIMO_V25_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
} from './savant-free-models'

import type { CostMode } from './model-config'

/**
 * The cost mode that indicates FREE mode.
 * Only allowlisted agent+model combinations cost 0 credits in this mode.
 */
export const FREE_COST_MODE = 'free' as const

/**
 * Root-orchestrator agent IDs counted as "a savant-free session" for abuse
 * detection and usage auditing. Subagents (file-picker, basher, etc.) are
 * excluded â€” they're spawned by the root, so counting them would inflate
 * every user's apparent activity.
 */
export const SAVANT_FREE_ROOT_AGENT_IDS = [
  'base2-free',
  'base2-free-kimi',
  'base2-free-deepseek',
  'base2-free-deepseek-flash',
  'base2-free-mimo-pro',
  'base2-free-mimo',
  'base2-free-minimax-m3',
] as const
const SAVANT_FREE_ROOT_AGENT_ID_SET: ReadonlySet<string> = new Set(
  SAVANT_FREE_ROOT_AGENT_IDS,
)

export const SAVANT_FREE_ROOT_AGENT_ID_BY_MODEL: Record<string, string> = {
  [SAVANT_FREE_MIMO_V25_PRO_MODEL_ID]: 'base2-free-mimo-pro',
  [SAVANT_FREE_MIMO_V25_MODEL_ID]: 'base2-free-mimo',
  [SAVANT_FREE_MINIMAX_MODEL_ID]: 'base2-free',
  [SAVANT_FREE_MINIMAX_M3_MODEL_ID]: 'base2-free-minimax-m3',
  [SAVANT_FREE_KIMI_MODEL_ID]: 'base2-free-kimi',
  [SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID]: 'base2-free-deepseek',
  [SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID]: 'base2-free-deepseek-flash',
}

export const SAVANT_FREE_REVIEWER_AGENT_ID_BY_MODEL: Record<string, string> = {
  [SAVANT_FREE_MIMO_V25_PRO_MODEL_ID]: 'code-reviewer-mimo-pro',
  [SAVANT_FREE_MIMO_V25_MODEL_ID]: 'code-reviewer-mimo',
  [SAVANT_FREE_MINIMAX_MODEL_ID]: 'code-reviewer-minimax',
  [SAVANT_FREE_MINIMAX_M3_MODEL_ID]: 'code-reviewer-minimax-m3',
  [SAVANT_FREE_KIMI_MODEL_ID]: 'code-reviewer-kimi',
  [SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID]: 'code-reviewer-deepseek',
  [SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID]: 'code-reviewer-deepseek-flash',
}

export function getSavant-FreeRootAgentIdForModel(model: string): string {
  return SAVANT_FREE_ROOT_AGENT_ID_BY_MODEL[model] ?? 'base2-free'
}

/**
 * Agents that are allowed to run in FREE mode.
 * Only these specific agents (and their expected models) get 0 credits in FREE mode.
 * This prevents abuse by users trying to use arbitrary agents for free.
 *
 * The mapping also specifies which models each agent is allowed to use in free mode.
 * If an agent uses a different model, it will be charged full credits.
 */
export const FREE_MODE_AGENT_MODELS: Record<string, Set<string>> = {
  // Root orchestrator
  'base2-free': new Set([
    SAVANT_FREE_MINIMAX_MODEL_ID,
    SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
    SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
    SAVANT_FREE_KIMI_MODEL_ID,
    SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
    SAVANT_FREE_MIMO_V25_MODEL_ID,
  ]),
  'base2-free-kimi': new Set([SAVANT_FREE_KIMI_MODEL_ID]),
  'base2-free-deepseek': new Set([SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID]),
  'base2-free-deepseek-flash': new Set([SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID]),
  'base2-free-mimo-pro': new Set([SAVANT_FREE_MIMO_V25_PRO_MODEL_ID]),
  'base2-free-mimo': new Set([SAVANT_FREE_MIMO_V25_MODEL_ID]),
  'base2-free-minimax-m3': new Set([SAVANT_FREE_MINIMAX_M3_MODEL_ID]),

  // File exploration agents
  'file-picker': new Set(['google/gemini-2.5-flash-lite']),
  'file-picker-max': new Set(['google/gemini-3.1-flash-lite-preview']),
  'file-lister': new Set(['google/gemini-3.1-flash-lite-preview']),

  // Research agents
  'researcher-web': new Set(['google/gemini-3.1-flash-lite-preview']),
  'researcher-docs': new Set(['google/gemini-3.1-flash-lite-preview']),

  // Browser automation
  'browser-use': new Set(['google/gemini-3.1-flash-lite-preview']),

  // Command execution
  basher: new Set(['google/gemini-3.1-flash-lite-preview']),
  'tmux-cli': new Set([SAVANT_FREE_MINIMAX_MODEL_ID]),

  // Code reviewer for free mode
  'code-reviewer-minimax': new Set([SAVANT_FREE_MINIMAX_MODEL_ID]),
  'code-reviewer-minimax-m3': new Set([SAVANT_FREE_MINIMAX_M3_MODEL_ID]),
  'code-reviewer-kimi': new Set([SAVANT_FREE_KIMI_MODEL_ID]),
  'code-reviewer-deepseek': new Set([SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID]),
  'code-reviewer-deepseek-flash': new Set([
    SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  ]),
  'code-reviewer-mimo-pro': new Set([SAVANT_FREE_MIMO_V25_PRO_MODEL_ID]),
  'code-reviewer-mimo': new Set([SAVANT_FREE_MIMO_V25_MODEL_ID]),
  // Legacy savant-free clients spawned code-reviewer-lite under provider-specific
  // free roots before those reviewer IDs existed.
  'code-reviewer-lite': new Set([
    SAVANT_FREE_MINIMAX_MODEL_ID,
    SAVANT_FREE_KIMI_MODEL_ID,
    SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
    SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
    SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
    SAVANT_FREE_MIMO_V25_MODEL_ID,
  ]),

  // Legacy: kept for the standalone gemini thinker agent if invoked directly.
  [SAVANT_FREE_GEMINI_THINKER_AGENT_ID]: new Set([SAVANT_FREE_GEMINI_PRO_MODEL_ID]),
}

/**
 * Agents that don't charge credits when credits would be very small (<5).
 *
 * These are typically lightweight utility agents that:
 * - Use cheap models (e.g., Gemini Flash)
 * - Have limited, programmatic capabilities
 * - Are frequently spawned as subagents
 *
 * Making them free avoids user confusion when they connect their own
 * Claude subscription (BYOK) but still see credit charges for non-Claude models.
 *
 * NOTE: This is separate from FREE_MODE_ALLOWED_AGENTS which is for the
 * explicit "free" cost mode. These agents get free credits only when
 * the cost would be trivial (<5 credits).
 */
export const FREE_TIER_AGENTS = new Set([
  'file-picker',
  'file-picker-max',
  'file-lister',
  'researcher-web',
  'researcher-docs',
])

/**
 * Check if the current cost mode is FREE mode.
 * In FREE mode, agents using allowed models cost 0 credits.
 */
export function isFreeMode(costMode: CostMode | string | undefined): boolean {
  return costMode === FREE_COST_MODE
}

export function isSavant-FreeRootAgent(fullAgentId: string): boolean {
  const { publisherId, agentId } = parseAgentId(fullAgentId)
  if (!agentId) return false
  if (publisherId && publisherId !== 'savant-code') return false
  return SAVANT_FREE_ROOT_AGENT_ID_SET.has(agentId)
}

export function isSavant-FreeGeminiThinkerAgent(fullAgentId: string): boolean {
  const { publisherId, agentId } = parseAgentId(fullAgentId)
  if (!agentId) return false
  if (publisherId && publisherId !== 'savant-code') return false
  return agentId === SAVANT_FREE_GEMINI_THINKER_AGENT_ID
}

export function shouldUseLocalTokenCountForSavant-FreeDeepseekFlash(params: {
  agentId: string | undefined
  model: string | undefined
}): boolean {
  const { agentId: fullAgentId, model } = params
  if (!fullAgentId || model !== SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID) {
    return false
  }

  const { publisherId, agentId } = parseAgentId(fullAgentId)
  if (publisherId && publisherId !== 'savant-code') return false
  return agentId === 'base2-free-deepseek-flash'
}

/**
 * Check if a specific agent is allowed to use a specific model in FREE mode.
 * This is the strictest check - validates both the agent AND model combination.
 *
 * Returns true only if:
 * 1. The agent has a valid agent ID
 * 2. The agent is in the allowed free-mode agents list
 * 3. The agent is either internal or published by 'savant-code' (prevents spoofing)
 * 4. The model is in that agent's allowed model set
 */
export function isFreeModeAllowedAgentModel(
  fullAgentId: string,
  model: string,
): boolean {
  const { publisherId, agentId } = parseAgentId(fullAgentId)

  // Must have a valid agent ID
  if (!agentId) return false

  // Must be either internal (no publisher) or from savant-code
  if (publisherId && publisherId !== 'savant-code') return false

  // Get the allowed models for this agent
  const allowedModels = FREE_MODE_AGENT_MODELS[agentId]
  if (!allowedModels) return false

  // Empty set means programmatic agent (no LLM calls expected)
  // For these, any model check should fail (they shouldn't be making LLM calls)
  if (allowedModels.size === 0) return false

  // Exact match first
  if (allowedModels.has(model)) return true

  // OpenRouter may return dated variants (e.g. "minimax/minimax-m2.7-20260211")
  // so also check date-like suffixes. Do not accept arbitrary suffixes:
  // "mimo-v2.5-pro" must not match the non-pro "mimo-v2.5" allowlist entry.
  for (const allowed of allowedModels) {
    const prefix = allowed + '-'
    if (model.startsWith(prefix)) {
      const suffix = model.slice(prefix.length)
      if (/^\d{6,8}(?:$|[-:])/.test(suffix)) return true
    }
  }

  return false
}

/**
 * Check if an agent should be free (no credit charge) for small requests.
 * This is separate from FREE mode - these agents get free credits only
 * when the cost would be trivial (<5 credits).
 *
 * Handles all agent ID formats:
 * - 'file-picker'
 * - 'file-picker@1.0.0'
 * - 'savant-code/file-picker@0.0.2'
 */
export function isFreeAgent(fullAgentId: string): boolean {
  const { publisherId, agentId } = parseAgentId(fullAgentId)

  // Must have a valid agent ID
  if (!agentId) return false

  // Must be in the free tier agents list
  if (!FREE_TIER_AGENTS.has(agentId)) return false

  // Must be either internal (no publisher) or from savant-code
  // This prevents publisher spoofing attacks
  if (publisherId && publisherId !== 'savant-code') return false

  return true
}
