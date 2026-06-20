import { SAVANT_FREE_PREMIUM_SESSION_RESET_TIMEZONE } from '@savant-code/common/constants/savant-free-models'
import { getZonedDayBounds } from '@savant-code/common/util/zoned-time'

import type { Savant-FreeSessionRateLimitByModel } from '@savant-code/common/types/savant-free-session'

export function getSavant-FreePremiumResetAt(params: {
  rateLimitsByModel?: Savant-FreeSessionRateLimitByModel
  nowMs: number
}): Date {
  const { rateLimitsByModel, nowMs } = params
  const serverResetAt = rateLimitsByModel
    ? Object.values(rateLimitsByModel)[0]?.resetAt
    : undefined
  const parsedServerResetAt = serverResetAt ? new Date(serverResetAt) : null

  if (
    parsedServerResetAt &&
    Number.isFinite(parsedServerResetAt.getTime())
  ) {
    return parsedServerResetAt
  }

  return getZonedDayBounds(
    new Date(nowMs),
    SAVANT_FREE_PREMIUM_SESSION_RESET_TIMEZONE,
  ).resetsAt
}

export function formatSavant-FreePremiumResetCountdown(
  resetAt: Date,
  nowMs: number,
): string {
  const diffMs = resetAt.getTime() - nowMs
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 'now'

  const totalMinutes = Math.max(1, Math.floor(diffMs / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}
