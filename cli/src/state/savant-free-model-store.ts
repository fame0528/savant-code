import {
  DEFAULT_SAVANT_FREE_MODEL_ID,
  resolveAvailableSavantFreeModel,
  resolveSupportedSavantFreeModel,
} from '@savant-code/common/constants/savant-free-models'
import { create } from 'zustand'

import { loadSavantFreeModelPreference } from '../utils/settings'

/**
 * Holds the user's currently-selected SavantFree model. Initialized from the
 * persisted settings file so SavantFree defaults to whatever model the user
 * last picked.
 *
 * `setSelectedModel` is in-memory only â€” it does NOT persist. Persistence
 * happens exclusively in `joinSavantFreeQueue` (the explicit-pick path), so
 * server-driven auto-flips (`model_locked`, `model_unavailable`, takeover)
 * can update the in-memory selection without overwriting the user's saved
 * preference. The latter previously caused users to get permanently flipped
 * to the fallback model after a single auto-fallback.
 *
 * Components in the waiting room read this to highlight the current row in
 * the model picker; the session hook reads it to decide which queue to join.
 */
interface SavantFreeModelStore {
  selectedModel: string
  setSelectedModel: (model: string) => void
}

export const useSavantFreeModelStore = create<SavantFreeModelStore>((set) => ({
  selectedModel: resolveAvailableSavantFreeModel(
    loadSavantFreeModelPreference() ?? DEFAULT_SAVANT_FREE_MODEL_ID,
  ),
  setSelectedModel: (model) =>
    set({ selectedModel: resolveSupportedSavantFreeModel(model) }),
}))

/** Imperative read for non-React callers (the session hook's tick loop and
 *  the chat-completions metadata builder). */
export function getSelectedSavantFreeModel(): string {
  return useSavantFreeModelStore.getState().selectedModel
}
