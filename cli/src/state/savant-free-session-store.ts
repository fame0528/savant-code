import { create } from 'zustand'

import type { SavantFreeSessionResponse } from '../types/savant-free-session'

/**
 * Shared state for the SavantFree waiting-room session.
 *
 * The hook in `use-savant-free-session.ts` owns the poll loop and writes into
 * this store; React components subscribe via selectors, and non-React code
 * reads via `useSavantFreeSessionStore.getState()`.
 *
 * Imperative session controls (force re-POST, mark superseded/ended) live on
 * the module exports of `use-savant-free-session.ts` rather than on this store â€”
 * that way callers don't need to null-check a "driver" slot whose lifetime
 * is tied to the React tree.
 */
interface SavantFreeSessionStore {
  session: SavantFreeSessionResponse | null
  error: string | null

  setSession: (session: SavantFreeSessionResponse | null) => void
  setError: (error: string | null) => void
}

export const useSavantFreeSessionStore = create<SavantFreeSessionStore>((set) => ({
  session: null,
  error: null,
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
}))
