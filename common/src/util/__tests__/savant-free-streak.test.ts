import { describe, expect, test } from 'bun:test'

import {
  addDaysToDateKey,
  calculateSavantFreeStreak,
  getSavantFreeUsageDateKey,
} from '../savant-free-streak'

describe('SavantFree streak helpers', () => {
  test('formats usage dates in the SavantFree reset timezone', () => {
    expect(getSavantFreeUsageDateKey(new Date('2026-05-27T06:30:00.000Z'))).toBe(
      '2026-05-26',
    )
    expect(getSavantFreeUsageDateKey(new Date('2026-05-27T08:30:00.000Z'))).toBe(
      '2026-05-27',
    )
  })

  test('adds days across month boundaries', () => {
    expect(addDaysToDateKey('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDaysToDateKey('2024-03-01', -1)).toBe('2024-02-29')
    expect(addDaysToDateKey('2026-12-31', 1)).toBe('2027-01-01')
  })

  test('counts a streak that includes today', () => {
    expect(
      calculateSavantFreeStreak({
        todayDateKey: '2026-05-27',
        usageDates: ['2026-05-25', '2026-05-23', '2026-05-27', '2026-05-26'],
      }),
    ).toEqual({
      streak: 3,
      todayUsed: true,
      lastUsageDate: '2026-05-27',
    })
  })

  test('keeps yesterday-anchored streaks alive before today is used', () => {
    expect(
      calculateSavantFreeStreak({
        todayDateKey: '2026-05-27',
        usageDates: ['2026-05-26', '2026-05-25', '2026-05-24'],
      }),
    ).toEqual({
      streak: 3,
      todayUsed: false,
      lastUsageDate: '2026-05-26',
    })
  })

  test('returns zero after a missed full day', () => {
    expect(
      calculateSavantFreeStreak({
        todayDateKey: '2026-05-27',
        usageDates: ['2026-05-25', '2026-05-24'],
      }),
    ).toEqual({
      streak: 0,
      todayUsed: false,
      lastUsageDate: '2026-05-25',
    })
  })
})
