import {
  DEFAULT_SAVANT_FREE_MODEL_ID,
  resolveAvailableSavant-FreeModel,
  resolveSupportedSavant-FreeModel,
} from '@savant-code/common/constants/savant-free-models'
import { create } from 'zustand'

import { loadSavant-FreeModelPreference } from '../utils/settings'

/**
 * Holds the user's currently-selected savant-free model. Initialized from the
 * persisted settings file so savant-free defaults to whatever model the user
 * last picked.
 *
 * `setSelectedModel` is in-memory only â€” it does NOT persist. Persistence
 * happens exclusively in `joinSavant-FreeQueue` (the explicit-pick path), so
 * server-driven auto-flips (`model_locked`, `model_unavailable`, takeover)
 * can update the in-memory selection without overwriting the user's saved
 * preference. The latter previously caused users to get permanently flipped
 * to the fallback model after a single auto-fallback.
 *
 * Components in the waiting room read this to highlight the current row in
 * the model picker; the session hook reads it to decide which queue to join.
 */
interface Savant-FreeModelStore {
  selectedModel: string
  setSelectedModel: (model: string) => void
}

export const useSavant-FreeModelStore = create<Savant-FreeModelStore>((set) => ({
  selectedModel: resolveAvailableSavant-FreeModel(
    loadSavant-FreeModelPreference() ?? DEFAULT_SAVANT_FREE_MODEL_ID,
  ),
  setSelectedModel: (model) =>
    set({ selectedModel: resolveSupportedSavant-FreeModel(model) }),
}))

/** Imperative read for non-React callers (the session hook's tick loop and
 *  the chat-completions metadata builder). */
export function getSelectedSavant-FreeModel(): string {
  return useSavant-FreeModelStore.getState().selectedModel
}
