import { describe, expect, test } from 'bun:test'

import {
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  SAVANT_FREE_GEMINI_PRO_MODEL_ID,
  SAVANT_FREE_KIMI_MODEL_ID,
  SAVANT_FREE_MINIMAX_MODEL_ID,
  SAVANT_FREE_MIMO_V25_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
} from '../constants/savant-free-models'
import { minimaxModels } from '../constants/model-config'
import { SAVANT_FREE_GEMINI_THINKER_AGENT_ID } from '../constants/savant-free-gemini-thinker'
import {
  getSavantFreeRootAgentIdForModel,
  isSavantFreeGeminiThinkerAgent,
  isFreeModeAllowedAgentModel,
  shouldUseLocalTokenCountForSavantFreeDeepseekFlash,
} from '../constants/free-agents'

const MINIMAX_M3_MODEL_ID = minimaxModels.minimaxM3

describe('free mode agent model allowlist', () => {
  test('maps supported SavantFree models to concrete root agents', () => {
    expect(getSavantFreeRootAgentIdForModel(SAVANT_FREE_MINIMAX_MODEL_ID)).toBe(
      'base2-free',
    )
    expect(getSavantFreeRootAgentIdForModel(SAVANT_FREE_KIMI_MODEL_ID)).toBe(
      'base2-free-kimi',
    )
    expect(
      getSavantFreeRootAgentIdForModel(SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID),
    ).toBe('base2-free-deepseek')
    expect(
      getSavantFreeRootAgentIdForModel(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID),
    ).toBe('base2-free-deepseek-flash')
    expect(getSavantFreeRootAgentIdForModel(SAVANT_FREE_MIMO_V25_PRO_MODEL_ID)).toBe(
      'base2-free-mimo-pro',
    )
    expect(getSavantFreeRootAgentIdForModel(SAVANT_FREE_MIMO_V25_MODEL_ID)).toBe(
      'base2-free-mimo',
    )
    expect(getSavantFreeRootAgentIdForModel(MINIMAX_M3_MODEL_ID)).toBe(
      'base2-free-minimax-m3',
    )
  })

  test('allows each SavantFree root agent only with its configured model', () => {
    expect(
      isFreeModeAllowedAgentModel('base2-free', SAVANT_FREE_MINIMAX_MODEL_ID),
    ).toBe(true)
    expect(isFreeModeAllowedAgentModel('base2-free', MINIMAX_M3_MODEL_ID)).toBe(
      false,
    )
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free',
        SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel('base2-free', SAVANT_FREE_KIMI_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel('base2-free-kimi', SAVANT_FREE_KIMI_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-deepseek',
        SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-deepseek-flash',
        SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-mimo-pro',
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-mimo',
        SAVANT_FREE_MIMO_V25_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-mimo',
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
      ),
    ).toBe(false)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-mimo',
        `${SAVANT_FREE_MIMO_V25_MODEL_ID}-20260527`,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel('base2-free-minimax-m3', MINIMAX_M3_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'base2-free-minimax-m3',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(false)
  })

  test('allows each SavantFree reviewer agent only with its configured model', () => {
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-minimax',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-minimax',
        SAVANT_FREE_KIMI_MODEL_ID,
      ),
    ).toBe(false)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-minimax-m3',
        MINIMAX_M3_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-minimax-m3',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(false)
    expect(
      isFreeModeAllowedAgentModel('code-reviewer-kimi', SAVANT_FREE_KIMI_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-deepseek',
        SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-deepseek-flash',
        SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-mimo-pro',
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-mimo',
        SAVANT_FREE_MIMO_V25_MODEL_ID,
      ),
    ).toBe(true)
  })

  test('allows legacy code-reviewer-lite with SavantFree reviewer models', () => {
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-lite',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel('code-reviewer-lite', MINIMAX_M3_MODEL_ID),
    ).toBe(false)
    expect(
      isFreeModeAllowedAgentModel('code-reviewer-lite', SAVANT_FREE_KIMI_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-lite',
        SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'code-reviewer-lite',
        SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      ),
    ).toBe(true)
  })

  test('allows the browser-use subagent with its bundled model', () => {
    expect(
      isFreeModeAllowedAgentModel(
        'browser-use',
        'google/gemini-3.1-flash-lite-preview',
      ),
    ).toBe(true)
  })

  test('allows the tmux-cli subagent with its bundled model', () => {
    expect(
      isFreeModeAllowedAgentModel('tmux-cli', SAVANT_FREE_MINIMAX_MODEL_ID),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'SavantCode/tmux-cli@0.0.1',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(true)
    expect(
      isFreeModeAllowedAgentModel(
        'other/tmux-cli@0.0.1',
        SAVANT_FREE_MINIMAX_MODEL_ID,
      ),
    ).toBe(false)
  })

  test('allows Gemini Pro for the thinker subagent but not the SavantFree root', () => {
    expect(
      isFreeModeAllowedAgentModel('base2-free', SAVANT_FREE_GEMINI_PRO_MODEL_ID),
    ).toBe(false)
    expect(
      isFreeModeAllowedAgentModel(
        SAVANT_FREE_GEMINI_THINKER_AGENT_ID,
        SAVANT_FREE_GEMINI_PRO_MODEL_ID,
      ),
    ).toBe(true)
  })

  test('recognizes the Gemini thinker agent in free mode', () => {
    expect(isSavantFreeGeminiThinkerAgent(SAVANT_FREE_GEMINI_THINKER_AGENT_ID)).toBe(
      true,
    )
    expect(
      isSavantFreeGeminiThinkerAgent(
        `SavantCode/${SAVANT_FREE_GEMINI_THINKER_AGENT_ID}@0.0.1`,
      ),
    ).toBe(true)
    expect(
      isSavantFreeGeminiThinkerAgent(
        `other/${SAVANT_FREE_GEMINI_THINKER_AGENT_ID}@0.0.1`,
      ),
    ).toBe(false)
  })

  test('uses local token count only for the DeepSeek Flash SavantFree root', () => {
    expect(
      shouldUseLocalTokenCountForSavantFreeDeepseekFlash({
        agentId: 'base2-free-deepseek-flash',
        model: SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      }),
    ).toBe(true)
    expect(
      shouldUseLocalTokenCountForSavantFreeDeepseekFlash({
        agentId: 'SavantCode/base2-free-deepseek-flash@0.0.1',
        model: SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      }),
    ).toBe(true)
    expect(
      shouldUseLocalTokenCountForSavantFreeDeepseekFlash({
        agentId: 'base2-free-deepseek',
        model: SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      }),
    ).toBe(false)
    expect(
      shouldUseLocalTokenCountForSavantFreeDeepseekFlash({
        agentId: 'base2-free-deepseek-flash',
        model: SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
      }),
    ).toBe(false)
    expect(
      shouldUseLocalTokenCountForSavantFreeDeepseekFlash({
        agentId: 'other/base2-free-deepseek-flash@0.0.1',
        model: SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      }),
    ).toBe(false)
  })
})
