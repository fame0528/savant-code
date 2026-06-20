import { describe, expect, test } from 'bun:test'

import type { PrintModeEvent } from '@savant-code/common/types/print-mode'

import {
  createMapPrintModeContext,
  mapPrintModeToStream,
} from '../utils/print-mode-to-stream'

const ctx = () =>
  createMapPrintModeContext({
    sessionId: 'session-1',
    model: 'claude-sonnet-4.6',
    defaultAgent: 'base',
  })

describe('mapPrintModeToStream (FID-2026-0620-007)', () => {
  test('start event → session.start with sessionId + agent + model', () => {
    const out = mapPrintModeToStream(
      {
        type: 'start',
        agentId: 'reviewer',
        messageHistoryLength: 0,
      } as PrintModeEvent,
      ctx(),
    )
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      v: 1,
      type: 'session.start',
      sessionId: 'session-1',
      agent: 'reviewer',
      model: 'claude-sonnet-4.6',
    })
  })

  test('start event without agentId falls back to defaultAgent', () => {
    const out = mapPrintModeToStream(
      {
        type: 'start',
        messageHistoryLength: 0,
      } as PrintModeEvent,
      ctx(),
    )
    expect(out[0]).toMatchObject({ agent: 'base' })
  })

  test('text event → message.assistant + message.assistant.done sharing the same id', () => {
    const out = mapPrintModeToStream(
      {
        type: 'text',
        text: 'Hello, world!',
      } as PrintModeEvent,
      ctx(),
    )
    expect(out).toHaveLength(2)
    expect(out[0].type).toBe('message.assistant')
    expect(out[1].type).toBe('message.assistant.done')
    if (out[0].type === 'message.assistant' && out[1].type === 'message.assistant.done') {
      expect(out[0].id).toBe(out[1].id)
      expect(out[0].delta).toBe('Hello, world!')
    }
  })

  test('reasoning_delta → message.reasoning with stable per-agent id', () => {
    const c = ctx()
    const a1 = mapPrintModeToStream(
      {
        type: 'reasoning_delta',
        text: 'first thought',
        ancestorRunIds: [],
        runId: 'r1',
        agentId: 'agent-x',
      } as PrintModeEvent,
      c,
    )
    const a2 = mapPrintModeToStream(
      {
        type: 'reasoning_delta',
        text: 'second thought',
        ancestorRunIds: [],
        runId: 'r1',
        agentId: 'agent-x',
      } as PrintModeEvent,
      c,
    )
    const b1 = mapPrintModeToStream(
      {
        type: 'reasoning_delta',
        text: 'different agent',
        ancestorRunIds: [],
        runId: 'r2',
        agentId: 'agent-y',
      } as PrintModeEvent,
      c,
    )
    expect(a1[0].type).toBe('message.reasoning')
    expect(a1[0].id).toBe(a2[0].id) // same agent → same id namespace
    expect(b1[0].id).not.toBe(a1[0].id) // different agent → different namespace
  })

  test('tool_call → tool.call with id, name, args', () => {
    const out = mapPrintModeToStream(
      {
        type: 'tool_call',
        toolCallId: 'tc-1',
        toolName: 'read_files',
        input: { paths: ['/tmp/x.ts'] },
      } as PrintModeEvent,
      ctx(),
    )
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      v: 1,
      type: 'tool.call',
      id: 'tc-1',
      name: 'read_files',
      args: { paths: ['/tmp/x.ts'] },
    })
  })

  test('tool_result → tool.result with output', () => {
    const out = mapPrintModeToStream(
      {
        type: 'tool_result',
        toolCallId: 'tc-1',
        toolName: 'read_files',
        output: [{ type: 'json', value: { content: 'export const x = 1' } }],
      } as unknown as PrintModeEvent,
      ctx(),
    )
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      v: 1,
      type: 'tool.result',
      id: 'tc-1',
      name: 'read_files',
    })
  })

  test('error → error event with message', () => {
    const out = mapPrintModeToStream(
      { type: 'error', message: 'Network timeout' } as PrintModeEvent,
      ctx(),
    )
    expect(out[0]).toMatchObject({
      v: 1,
      type: 'error',
      message: 'Network timeout',
    })
  })

  test('finish → session.end with reason: complete', () => {
    const out = mapPrintModeToStream(
      { type: 'finish', totalCost: 0.05 } as PrintModeEvent,
      ctx(),
    )
    expect(out[0]).toMatchObject({
      v: 1,
      type: 'session.end',
      reason: 'complete',
    })
  })

  test('subagent_start / subagent_finish / download are suppressed (v0.1)', () => {
    const c = ctx()
    const events: PrintModeEvent[] = [
      { type: 'subagent_start', agentId: 'a', agentType: 't', displayName: 'd', onlyChild: true } as unknown as PrintModeEvent,
      { type: 'subagent_finish', agentId: 'a', agentType: 't', displayName: 'd', onlyChild: true } as unknown as PrintModeEvent,
      { type: 'download', version: '1.0.0', status: 'complete' } as PrintModeEvent,
    ]
    for (const ev of events) {
      expect(mapPrintModeToStream(ev, c)).toEqual([])
    }
  })

  test('every emitted event has v: 1 schema version (Q9 from FID-006)', () => {
    const c = ctx()
    const events: PrintModeEvent[] = [
      { type: 'start', messageHistoryLength: 0 } as PrintModeEvent,
      { type: 'text', text: 'hi' } as PrintModeEvent,
      { type: 'reasoning_delta', text: 'hmm', ancestorRunIds: [], runId: 'r', agentId: 'a' } as PrintModeEvent,
      { type: 'tool_call', toolCallId: 't', toolName: 'n', input: {} } as PrintModeEvent,
      { type: 'tool_result', toolCallId: 't', toolName: 'n', output: [] } as unknown as PrintModeEvent,
      { type: 'error', message: 'x' } as PrintModeEvent,
      { type: 'finish', totalCost: 0 } as PrintModeEvent,
    ]
    for (const ev of events) {
      for (const out of mapPrintModeToStream(ev, c)) {
        expect(out.v).toBe(1)
      }
    }
  })
})

describe('createMapPrintModeContext', () => {
  test('message ids are stable per (kind, agentId) and incrementing', () => {
    const c = createMapPrintModeContext({
      sessionId: 's',
      model: 'm',
      defaultAgent: 'a',
    })
    const a1 = c.nextMessageId('assistant')
    const a2 = c.nextMessageId('assistant')
    const a3 = c.nextMessageId('assistant')
    expect(a1).toBe('assistant:_#1')
    expect(a2).toBe('assistant:_#2')
    expect(a3).toBe('assistant:_#3')
  })

  test('different kinds have separate counters', () => {
    const c = createMapPrintModeContext({
      sessionId: 's',
      model: 'm',
      defaultAgent: 'a',
    })
    const a1 = c.nextMessageId('assistant')
    const r1 = c.nextMessageId('reasoning')
    expect(a1).toBe('assistant:_#1')
    expect(r1).toBe('reasoning:_#1')
  })
})
