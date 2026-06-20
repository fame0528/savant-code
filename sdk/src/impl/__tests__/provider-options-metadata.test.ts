import { describe, expect, it } from 'bun:test'

import { getProviderOptions } from '../llm'

describe('getProviderOptions â€” savant-code_metadata', () => {
  const baseParams = {
    model: 'openrouter/anthropic/claude-sonnet-4-5',
    runId: 'run-1',
    clientSessionId: 'session-1',
  }

  it('includes run_id and client_id in savant-code_metadata', () => {
    const opts = getProviderOptions(baseParams)
    const meta = (opts.savant-code as any).savant-code_metadata
    expect(meta).toMatchObject({
      run_id: 'run-1',
      client_id: 'session-1',
    })
  })

  it('merges extraSavant-CodeMetadata into savant-code_metadata', () => {
    const opts = getProviderOptions({
      ...baseParams,
      extraSavant-CodeMetadata: { savant-free_instance_id: 'abc-123' },
    })
    const meta = (opts.savant-code as any).savant-code_metadata
    expect(meta).toMatchObject({
      run_id: 'run-1',
      client_id: 'session-1',
      savant-free_instance_id: 'abc-123',
    })
  })

  it('omits extra keys when extraSavant-CodeMetadata is undefined', () => {
    const opts = getProviderOptions(baseParams)
    const meta = (opts.savant-code as any).savant-code_metadata
    expect(Object.keys(meta)).toEqual(
      expect.arrayContaining(['run_id', 'client_id']),
    )
    expect(meta.savant-free_instance_id).toBeUndefined()
  })

  it('cost_mode passes through alongside extra metadata', () => {
    const opts = getProviderOptions({
      ...baseParams,
      costMode: 'free',
      extraSavant-CodeMetadata: { savant-free_instance_id: 'uuid-xyz' },
    })
    const meta = (opts.savant-code as any).savant-code_metadata
    expect(meta).toMatchObject({
      cost_mode: 'free',
      savant-free_instance_id: 'uuid-xyz',
    })
  })

  it('extraSavant-CodeMetadata does not overwrite reserved keys', () => {
    const opts = getProviderOptions({
      ...baseParams,
      costMode: 'free',
      extraSavant-CodeMetadata: {
        // These are intentionally the same keys the function already sets â€”
        // make sure a misuse doesn't let callers override server-trusted
        // identifiers. The spread currently puts caller keys last, which
        // means it WOULD override. If that's ever intentional, change this
        // test; for now, lock it down.
        run_id: 'evil-override',
      },
    })
    const meta = (opts.savant-code as any).savant-code_metadata
    expect(meta.run_id).toBe('run-1')
  })
})
