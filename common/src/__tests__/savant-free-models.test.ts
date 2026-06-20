import { describe, expect, test } from 'bun:test'

import {
  canSavant-FreeModelSpawnGeminiThinker,
  DEFAULT_SAVANT_FREE_MODEL_ID,
  FALLBACK_SAVANT_FREE_MODEL_ID,
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  SAVANT_FREE_DATA_COLLECTION_WARNING,
  SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  SAVANT_FREE_ENABLE_MIMO_MODELS_IN_UI,
  SAVANT_FREE_KIMI_MODEL_ID,
  LIMITED_SAVANT_FREE_MODEL_ID,
  LIMITED_SAVANT_FREE_MODEL_IDS,
  SAVANT_FREE_MINIMAX_MODEL_ID,
  SAVANT_FREE_MIMO_V25_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
  SAVANT_FREE_MODELS,
  SUPPORTED_SAVANT_FREE_MODELS,
  getSavant-FreeDeploymentAvailabilityLabel,
  getSavant-FreeModelsForAccessTier,
  getRecommendedSavant-FreeModelId,
  isSavant-FreeDeploymentHours,
  isSavant-FreeTracedModelId,
  isSavant-FreeModelId,
  isSavant-FreeModelAllowedForAccessTier,
  isSavant-FreePremiumModelId,
  isSupportedSavant-FreeModelId,
  resolveSavant-FreeModelForAccessTier,
} from '../constants/savant-free-models'
import type { Savant-FreeModelOption } from '../constants/savant-free-models'
import { minimaxModels } from '../constants/model-config'

const MINIMAX_M3_MODEL_ID = minimaxModels.minimaxM3

describe('savant-free model availability', () => {
  test('defaults to MiniMax M3, falls back to DeepSeek V4 Flash for new clients', () => {
    expect(DEFAULT_SAVANT_FREE_MODEL_ID).toBe(MINIMAX_M3_MODEL_ID)
    expect(FALLBACK_SAVANT_FREE_MODEL_ID).toBe(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)
  })

  test('DeepSeek Pro carries the data-collection warning so users see it before picking', () => {
    const deepseek = SAVANT_FREE_MODELS.find(
      (m) => m.id === SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
    )
    expect((deepseek as { warning?: string } | undefined)?.warning).toBe(
      'Collects data for training',
    )
  })

  test('DeepSeek Flash carries the data-collection warning so users see it before picking', () => {
    const deepseek = SAVANT_FREE_MODELS.find(
      (m) => m.id === SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
    )
    expect((deepseek as { warning?: string } | undefined)?.warning).toBe(
      'Collects data for training',
    )
  })

  test('only the DeepSeek family is trace-stored in free mode; M3 has no warning', () => {
    const m3 = SAVANT_FREE_MODELS.find((m) => m.id === MINIMAX_M3_MODEL_ID)
    expect((m3 as { warning?: string } | undefined)?.warning).toBeUndefined()
    // The DeepSeek family discloses data collection and IS stored.
    expect(isSavant-FreeTracedModelId(SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID)).toBe(true)
    expect(isSavant-FreeTracedModelId(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)).toBe(
      true,
    )
    // Everything else (incl. M3 on Fireworks) is NOT stored.
    expect(isSavant-FreeTracedModelId(MINIMAX_M3_MODEL_ID)).toBe(false)
    expect(isSavant-FreeTracedModelId(SAVANT_FREE_KIMI_MODEL_ID)).toBe(false)
    expect(isSavant-FreeTracedModelId(SAVANT_FREE_MIMO_V25_MODEL_ID)).toBe(false)
    expect(isSavant-FreeTracedModelId(null)).toBe(false)
  })

  test('trace storage is one source of truth with the data-collection warning', () => {
    // A model is traced in free mode iff it shows the data-collection caveat.
    const models: readonly Savant-FreeModelOption[] = SUPPORTED_SAVANT_FREE_MODELS
    for (const model of models) {
      expect(isSavant-FreeTracedModelId(model.id)).toBe(
        model.warning === SAVANT_FREE_DATA_COLLECTION_WARNING,
      )
    }
  })

  test('DeepSeek V4 Flash is selectable and non-premium', () => {
    expect(SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
    )
    expect(isSavant-FreeModelId(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)).toBe(true)
    expect(isSavant-FreePremiumModelId(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)).toBe(
      false,
    )
  })

  test('MiMo models remain supported and follow the UI rollout flag', () => {
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
    )
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_MIMO_V25_MODEL_ID,
    )

    if (SAVANT_FREE_ENABLE_MIMO_MODELS_IN_UI) {
      expect(SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
      )
      expect(SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
        SAVANT_FREE_MIMO_V25_MODEL_ID,
      )
    } else {
      expect(SAVANT_FREE_MODELS.map((model) => model.id)).not.toContain(
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
      )
      expect(SAVANT_FREE_MODELS.map((model) => model.id)).not.toContain(
        SAVANT_FREE_MIMO_V25_MODEL_ID,
      )
    }

    expect(isSavant-FreePremiumModelId(SAVANT_FREE_MIMO_V25_PRO_MODEL_ID)).toBe(true)
    expect(isSavant-FreePremiumModelId(SAVANT_FREE_MIMO_V25_MODEL_ID)).toBe(false)
  })

  test('Kimi is selectable in full mode', () => {
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_KIMI_MODEL_ID,
    )
    expect(SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_KIMI_MODEL_ID,
    )
    expect(getSavant-FreeModelsForAccessTier('full').map((m) => m.id)).toContain(
      SAVANT_FREE_KIMI_MODEL_ID,
    )
    expect(isSavant-FreeModelId(SAVANT_FREE_KIMI_MODEL_ID)).toBe(true)
    expect(isSupportedSavant-FreeModelId(SAVANT_FREE_KIMI_MODEL_ID)).toBe(true)
    expect(
      isSavant-FreeModelAllowedForAccessTier(SAVANT_FREE_KIMI_MODEL_ID, 'full'),
    ).toBe(true)
  })

  test('MiniMax M2.7 is legacy: hidden from pickers but still served for old clients', () => {
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      SAVANT_FREE_MINIMAX_MODEL_ID,
    )
    expect(SAVANT_FREE_MODELS.map((model) => model.id)).not.toContain(
      SAVANT_FREE_MINIMAX_MODEL_ID,
    )
    expect(
      getSavant-FreeModelsForAccessTier('full').map((m) => m.id),
    ).not.toContain(SAVANT_FREE_MINIMAX_MODEL_ID)
    expect(isSavant-FreeModelId(SAVANT_FREE_MINIMAX_MODEL_ID)).toBe(false)
    expect(isSupportedSavant-FreeModelId(SAVANT_FREE_MINIMAX_MODEL_ID)).toBe(true)
    // Old clients with a saved M2.7 selection must still be admitted.
    expect(
      isSavant-FreeModelAllowedForAccessTier(SAVANT_FREE_MINIMAX_MODEL_ID, 'full'),
    ).toBe(true)
    expect(
      resolveSavant-FreeModelForAccessTier(SAVANT_FREE_MINIMAX_MODEL_ID, 'full'),
    ).toBe(SAVANT_FREE_MINIMAX_MODEL_ID)
  })

  test('MiniMax M3 is a selectable unlimited model, last in the unlimited section', () => {
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      MINIMAX_M3_MODEL_ID,
    )
    expect(SAVANT_FREE_MODELS.map((model) => model.id)).toContain(
      MINIMAX_M3_MODEL_ID,
    )
    expect(
      getSavant-FreeModelsForAccessTier('full').map((m) => m.id),
    ).toContain(MINIMAX_M3_MODEL_ID)
    expect(isSavant-FreeModelId(MINIMAX_M3_MODEL_ID)).toBe(true)
    expect(isSupportedSavant-FreeModelId(MINIMAX_M3_MODEL_ID)).toBe(true)
    expect(isSavant-FreePremiumModelId(MINIMAX_M3_MODEL_ID)).toBe(false)
    expect(
      isSavant-FreeModelAllowedForAccessTier(MINIMAX_M3_MODEL_ID, 'full'),
    ).toBe(true)
    // Pickers split sections by the premium flag while preserving array order,
    // so "last unlimited entry" means last in SAVANT_FREE_MODELS overall.
    expect(SAVANT_FREE_MODELS[SAVANT_FREE_MODELS.length - 1]!.id).toBe(
      MINIMAX_M3_MODEL_ID,
    )
  })

  test('limited access exposes DeepSeek V4 Flash and non-Pro MiMo 2.5', () => {
    expect(LIMITED_SAVANT_FREE_MODEL_ID).toBe(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)
    expect(LIMITED_SAVANT_FREE_MODEL_IDS).toEqual([
      SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      SAVANT_FREE_MIMO_V25_MODEL_ID,
    ])
    expect(getSavant-FreeModelsForAccessTier('limited').map((m) => m.id)).toEqual([
      SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
      SAVANT_FREE_MIMO_V25_MODEL_ID,
    ])
    expect(
      isSavant-FreeModelAllowedForAccessTier(
        SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
        'limited',
      ),
    ).toBe(true)
    expect(
      isSavant-FreeModelAllowedForAccessTier(SAVANT_FREE_MINIMAX_MODEL_ID, 'limited'),
    ).toBe(false)
    expect(
      isSavant-FreeModelAllowedForAccessTier(MINIMAX_M3_MODEL_ID, 'limited'),
    ).toBe(false)
    expect(
      isSavant-FreeModelAllowedForAccessTier(
        SAVANT_FREE_MIMO_V25_MODEL_ID,
        'limited',
      ),
    ).toBe(true)
    expect(
      isSavant-FreeModelAllowedForAccessTier(
        SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
        'limited',
      ),
    ).toBe(false)
    expect(
      resolveSavant-FreeModelForAccessTier(SAVANT_FREE_MIMO_V25_MODEL_ID, 'limited'),
    ).toBe(SAVANT_FREE_MIMO_V25_MODEL_ID)
    expect(
      resolveSavant-FreeModelForAccessTier(SAVANT_FREE_MINIMAX_MODEL_ID, 'limited'),
    ).toBe(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID)
  })

  test('recommends an unlimited, in-tier model for the picker hero', () => {
    // Full access â†’ MiniMax M3 (the unlimited default), so the one-Enter
    // start never burns a premium session.
    expect(getRecommendedSavant-FreeModelId('full')).toBe(MINIMAX_M3_MODEL_ID)
    expect(getRecommendedSavant-FreeModelId(undefined)).toBe(MINIMAX_M3_MODEL_ID)
    expect(isSavant-FreePremiumModelId(getRecommendedSavant-FreeModelId('full'))).toBe(
      false,
    )
    // Limited access â†’ DeepSeek V4 Flash, which is in the limited model set.
    expect(getRecommendedSavant-FreeModelId('limited')).toBe(
      SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
    )
    expect(
      getSavant-FreeModelsForAccessTier('limited').some(
        (m) => m.id === getRecommendedSavant-FreeModelId('limited'),
      ),
    ).toBe(true)
  })

  test('full-access savant-free models can spawn the gemini-thinker subagent', () => {
    // Full-access models (non-limited, non-fastest) get the thinker.
    expect(canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_KIMI_MODEL_ID)).toBe(
      true,
    )
    expect(
      canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID),
    ).toBe(true)
    expect(
      canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_MIMO_V25_PRO_MODEL_ID),
    ).toBe(true)
    expect(canSavant-FreeModelSpawnGeminiThinker(MINIMAX_M3_MODEL_ID)).toBe(true)

    // Legacy "Fastest" MiniMax M2.7 skips it to preserve the fastest tier.
    expect(canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_MINIMAX_MODEL_ID)).toBe(
      false,
    )
    // Limited-tier models (DeepSeek V4 Flash, MiMo 2.5) skip it.
    expect(
      canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID),
    ).toBe(false)
    expect(canSavant-FreeModelSpawnGeminiThinker(SAVANT_FREE_MIMO_V25_MODEL_ID)).toBe(
      false,
    )
  })

  test('does not support GLM 5.1 for savant-free sessions', () => {
    const glm = 'z-ai/glm-5.1'
    expect(SAVANT_FREE_MODELS.map((model) => model.id)).not.toContain(glm)
    expect(SUPPORTED_SAVANT_FREE_MODELS.map((model) => model.id)).not.toContain(
      glm,
    )
    expect(isSavant-FreeModelId(glm)).toBe(false)
    expect(isSupportedSavant-FreeModelId(glm)).toBe(false)
  })

  test('formats the close time in the user local timezone while deployment is open', () => {
    expect(
      getSavant-FreeDeploymentAvailabilityLabel(new Date('2026-01-05T18:00:00Z'), {
        locale: 'en-US',
        timeZone: 'America/Los_Angeles',
      }),
    ).toBe('until 5:00 PM')
  })

  test('formats the next open time in the user local timezone while deployment is closed', () => {
    expect(
      getSavant-FreeDeploymentAvailabilityLabel(new Date('2026-01-05T12:00:00Z'), {
        locale: 'en-US',
        timeZone: 'America/Los_Angeles',
      }),
    ).toBe('opens 6:00 AM')
  })

  test('includes the weekday when the next opening is on a later local day', () => {
    expect(
      getSavant-FreeDeploymentAvailabilityLabel(new Date('2026-01-11T03:00:00Z'), {
        locale: 'en-US',
        timeZone: 'America/Los_Angeles',
      }),
    ).toBe('opens Sun 6:00 AM')
  })

  test('tracks deployment hours correctly across the open and close boundaries', () => {
    expect(isSavant-FreeDeploymentHours(new Date('2026-01-05T13:59:00Z'))).toBe(
      false,
    )
    expect(isSavant-FreeDeploymentHours(new Date('2026-01-05T14:00:00Z'))).toBe(
      true,
    )
    expect(isSavant-FreeDeploymentHours(new Date('2026-01-06T00:59:00Z'))).toBe(
      true,
    )
    expect(isSavant-FreeDeploymentHours(new Date('2026-01-06T01:00:00Z'))).toBe(
      false,
    )
    expect(isSavant-FreeDeploymentHours(new Date('2026-01-10T20:00:00Z'))).toBe(
      true,
    )
  })
})
