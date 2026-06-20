import { useKeyboard } from '@opentui/react'
import { useCallback } from 'react'

import { exitSavant-FreeCleanly } from '../utils/savant-free-exit'

import type { KeyEvent } from '@opentui/core'

/**
 * Bind Ctrl+C on a full-screen savant-free view to `exitSavant-FreeCleanly`. Stdin
 * is in raw mode, so SIGINT never fires â€” the key arrives as a normal OpenTUI
 * key event and we route it through the shared cleanup path (flush analytics,
 * release the session seat, then process.exit).
 */
export function useSavant-FreeCtrlCExit(): void {
  useKeyboard(
    useCallback((key: KeyEvent) => {
      if (key.ctrl && key.name === 'c') {
        key.preventDefault?.()
        exitSavant-FreeCleanly()
      }
    }, []),
  )
}
