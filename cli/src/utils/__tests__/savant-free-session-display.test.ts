import { describe, expect, test } from 'bun:test'

import {
  formatSavant-FreeSessionCountdown,
  formatSavant-FreeSessionRemaining,
} from '../savant-free-session-display'

describe('savant-free session display formatting', () => {
  test('formats urgent countdowns', () => {
    expect(formatSavant-FreeSessionCountdown(61_000)).toBe('1:01')
    expect(formatSavant-FreeSessionRemaining(61_000)).toBe('1:01 left')
  })

  test('formats minute and hour remaining labels', () => {
    expect(formatSavant-FreeSessionRemaining(5 * 60_000)).toBe('5m left')
    expect(formatSavant-FreeSessionRemaining(60 * 60_000)).toBe('1h left')
    expect(formatSavant-FreeSessionRemaining(90 * 60_000)).toBe('1h 30m left')
  })

  test('formats expired sessions as expiring', () => {
    expect(formatSavant-FreeSessionRemaining(0)).toBe('expiringâ€¦')
  })
})
