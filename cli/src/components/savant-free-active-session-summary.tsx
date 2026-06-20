import React from 'react'

import { useSavant-FreeSessionProgress } from '../hooks/use-savant-free-session-progress'
import { useNow } from '../hooks/use-now'
import { useTheme } from '../hooks/use-theme'
import { formatSavant-FreePremiumResetCountdown } from '../utils/savant-free-premium-reset'
import { formatSessionUnits } from '../utils/format-session-units'

import type { Savant-FreeSessionResponse } from '../types/savant-free-session'

interface Savant-FreeActiveSessionSummaryProps {
  session: Savant-FreeSessionResponse | null
}

export const Savant-FreeActiveSessionSummary: React.FC<
  Savant-FreeActiveSessionSummaryProps
> = ({ session }) => {
  const theme = useTheme()
  const now = useNow(60_000, session?.status === 'active')
  const progress = useSavant-FreeSessionProgress(session)
  const quota = session?.status === 'active' ? session.rateLimit : undefined

  if (session?.status !== 'active' || !progress) {
    return null
  }

  if (!quota) {
    return null
  }

  const resetCountdown = formatSavant-FreePremiumResetCountdown(
    new Date(quota.resetAt),
    now
  )
  const label =
    'accessTier' in session && session.accessTier === 'limited'
      ? 'sessions'
      : 'premium sessions'
  // recentCount already includes the active session's 1.0-unit reservation
  // (written as an admit row at promotion), so it reflects everything counted
  // against the quota â€” spent plus in-flight. Show it as the total used to match
  // the model selection menu and the other session-status screens.
  return (
    <box
      style={{
        paddingLeft: 1,
        paddingRight: 1,
        marginBottom: 1,
        flexShrink: 0,
      }}
    >
      <text style={{ wrapMode: 'word', fg: theme.muted }}>
        <span fg={theme.foreground}>
          {formatSessionUnits(quota.recentCount)} of {quota.limit}
        </span>
        <span fg={theme.muted}>
          {' '}
          {label} used Â· resets in {resetCountdown}
        </span>
      </text>
    </box>
  )
}
