import { describe, expect, test } from 'bun:test'

import {
  SavantFreeModelNavigationDirectionForKey,
  nextSavantFreeModelId,
} from '../savant-free-model-navigation'

describe('nextSavantFreeModelId', () => {
  test('moves to the next model when moving forward', () => {
    const modelIds = ['glm', 'minimax']

    expect(
      nextSavantFreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'forward',
      }),
    ).toBe('glm')
  })

  test('moves to the previous model when moving backward', () => {
    const modelIds = ['glm', 'minimax']

    expect(
      nextSavantFreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'backward',
      }),
    ).toBe('glm')
  })

  test('wraps through every model regardless of selectability', () => {
    const modelIds = ['glm', 'minimax', 'other']

    expect(
      nextSavantFreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'forward',
      }),
    ).toBe('other')
  })

  test('returns null when no model exists', () => {
    expect(
      nextSavantFreeModelId({
        modelIds: [],
        focusedId: 'glm',
        direction: 'forward',
      }),
    ).toBeNull()
  })
})

describe('SavantFreeModelNavigationDirectionForKey', () => {
  test('maps arrow keys to model navigation directions', () => {
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'down' })).toBe(
      'forward',
    )
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'right' })).toBe(
      'forward',
    )
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'up' })).toBe(
      'backward',
    )
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'left' })).toBe(
      'backward',
    )
  })

  test('maps tab and shift-tab to model navigation directions', () => {
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'tab' })).toBe(
      'forward',
    )
    expect(
      SavantFreeModelNavigationDirectionForKey({ name: 'tab', shift: true }),
    ).toBe('backward')
  })

  test('maps terminal tab sequences to model navigation directions', () => {
    expect(SavantFreeModelNavigationDirectionForKey({ sequence: '\t' })).toBe(
      'forward',
    )
    expect(
      SavantFreeModelNavigationDirectionForKey({ sequence: '\x1b[9u' }),
    ).toBe('forward')
    expect(
      SavantFreeModelNavigationDirectionForKey({ sequence: '\x1b[Z' }),
    ).toBe('backward')
    expect(
      SavantFreeModelNavigationDirectionForKey({ sequence: '\x1b[9;2u' }),
    ).toBe('backward')
    expect(
      SavantFreeModelNavigationDirectionForKey({ sequence: '\x1b[27;2;9~' }),
    ).toBe('backward')
  })

  test('ignores non-navigation keys', () => {
    expect(SavantFreeModelNavigationDirectionForKey({ name: 'enter' })).toBeNull()
  })
})
