import { describe, expect, test } from 'bun:test'

import {
  savant-freeModelNavigationDirectionForKey,
  nextSavant-FreeModelId,
} from '../savant-free-model-navigation'

describe('nextSavant-FreeModelId', () => {
  test('moves to the next model when moving forward', () => {
    const modelIds = ['glm', 'minimax']

    expect(
      nextSavant-FreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'forward',
      }),
    ).toBe('glm')
  })

  test('moves to the previous model when moving backward', () => {
    const modelIds = ['glm', 'minimax']

    expect(
      nextSavant-FreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'backward',
      }),
    ).toBe('glm')
  })

  test('wraps through every model regardless of selectability', () => {
    const modelIds = ['glm', 'minimax', 'other']

    expect(
      nextSavant-FreeModelId({
        modelIds,
        focusedId: 'minimax',
        direction: 'forward',
      }),
    ).toBe('other')
  })

  test('returns null when no model exists', () => {
    expect(
      nextSavant-FreeModelId({
        modelIds: [],
        focusedId: 'glm',
        direction: 'forward',
      }),
    ).toBeNull()
  })
})

describe('savant-freeModelNavigationDirectionForKey', () => {
  test('maps arrow keys to model navigation directions', () => {
    expect(savant-freeModelNavigationDirectionForKey({ name: 'down' })).toBe(
      'forward',
    )
    expect(savant-freeModelNavigationDirectionForKey({ name: 'right' })).toBe(
      'forward',
    )
    expect(savant-freeModelNavigationDirectionForKey({ name: 'up' })).toBe(
      'backward',
    )
    expect(savant-freeModelNavigationDirectionForKey({ name: 'left' })).toBe(
      'backward',
    )
  })

  test('maps tab and shift-tab to model navigation directions', () => {
    expect(savant-freeModelNavigationDirectionForKey({ name: 'tab' })).toBe(
      'forward',
    )
    expect(
      savant-freeModelNavigationDirectionForKey({ name: 'tab', shift: true }),
    ).toBe('backward')
  })

  test('maps terminal tab sequences to model navigation directions', () => {
    expect(savant-freeModelNavigationDirectionForKey({ sequence: '\t' })).toBe(
      'forward',
    )
    expect(
      savant-freeModelNavigationDirectionForKey({ sequence: '\x1b[9u' }),
    ).toBe('forward')
    expect(
      savant-freeModelNavigationDirectionForKey({ sequence: '\x1b[Z' }),
    ).toBe('backward')
    expect(
      savant-freeModelNavigationDirectionForKey({ sequence: '\x1b[9;2u' }),
    ).toBe('backward')
    expect(
      savant-freeModelNavigationDirectionForKey({ sequence: '\x1b[27;2;9~' }),
    ).toBe('backward')
  })

  test('ignores non-navigation keys', () => {
    expect(savant-freeModelNavigationDirectionForKey({ name: 'enter' })).toBeNull()
  })
})
