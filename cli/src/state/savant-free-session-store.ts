import { create } from 'zustand'

import type { Savant-FreeSessionResponse } from '../types/savant-free-session'

/**
 * Shared state for the savant-free waiting-room session.
 *
 * The hook in `use-savant-free-session.ts` owns the poll loop and writes into
 * this store; React components subscribe via selectors, and non-React code
 * reads via `useSavant-FreeSessionStore.getState()`.
 *
 * Imperative session controls (force re-POST, mark superseded/ended) live on
 * the module exports of `use-savant-free-session.ts` rather than on this store â€”
 * that way callers don't need to null-check a "driver" slot whose lifetime
 * is tied to the React tree.
 */
interface Savant-FreeSessionStore {
  session: Savant-FreeSessionResponse | null
  error: string | null

  setSession: (session: Savant-FreeSessionResponse | null) => void
  setError: (error: string | null) => void
}

export const useSavant-FreeSessionStore = create<Savant-FreeSessionStore>((set) => ({
  session: null,
  error: null,
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
}))
