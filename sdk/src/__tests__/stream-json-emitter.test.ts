import { Writable } from 'stream'

import { describe, expect, test } from 'bun:test'

import {
  STREAM_JSON_SCHEMA_VERSION,
  type StreamEvent,
} from '../types/stream-events'
import { StreamJsonEmitter, createStdoutEmitter } from '../utils/stream-json-emitter'

/**
 * Collect-only writable stream for tests.
 */
class CollectWritable extends Writable {
  chunks: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override _write(chunk: any, _enc: BufferEncoding, cb: (err?: Error | null) => void) {
    this.chunks.push(String(chunk))
    cb()
  }
  get text(): string {
    return this.chunks.join('')
  }
}

describe('STREAM_JSON_SCHEMA_VERSION', () => {
  test('is 1 (Q9 — schema versioning)', () => {
    expect(STREAM_JSON_SCHEMA_VERSION).toBe(1)
  })
})

describe('StreamJsonEmitter (FID-2026-0620-006)', () => {
  test('emits one NDJSON line per event with v:1 schema field', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({
      destination: dest,
      isTTY: false,
    })

    const event: StreamEvent = {
      v: 1,
      type: 'session.start',
      sessionId: 'abc-123',
      agent: 'base',
      model: 'claude-sonnet-4.6',
      ts: 1234567890,
    }
    emitter.emit(event)

    const lines = dest.text.split('\n').filter((l) => l.length > 0)
    expect(lines).toHaveLength(1)

    const parsed = JSON.parse(lines[0])
    expect(parsed.v).toBe(1)
    expect(parsed.type).toBe('session.start')
    expect(parsed.sessionId).toBe('abc-123')
    expect(parsed.agent).toBe('base')
    expect(parsed.model).toBe('claude-sonnet-4.6')
    expect(parsed.ts).toBe(1234567890)
  })

  test('emits multiple events as separate lines (NDJSON)', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({ destination: dest, isTTY: false })

    emitter.emit({ v: 1, type: 'session.start', sessionId: 's1', agent: 'base', model: 'm', ts: 1 })
    emitter.emit({ v: 1, type: 'message.user', id: 'm1', content: 'hello', ts: 2 })
    emitter.emit({ v: 1, type: 'session.end', reason: 'complete', ts: 3 })

    const lines = dest.text.split('\n').filter((l) => l.length > 0)
    expect(lines).toHaveLength(3)
    expect(JSON.parse(lines[0]).type).toBe('session.start')
    expect(JSON.parse(lines[1]).type).toBe('message.user')
    expect(JSON.parse(lines[2]).type).toBe('session.end')
  })

  test('chunked message.assistant events (Q10)', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({ destination: dest, isTTY: false })

    const messageId = 'msg-1'
    const reply = 'Hello, world!'
    for (let i = 0; i < reply.length; i += 5) {
      emitter.emit({
        v: 1,
        type: 'message.assistant',
        id: messageId,
        delta: reply.slice(i, i + 5),
        ts: 100 + i,
      })
    }
    emitter.emit({ v: 1, type: 'message.assistant.done', id: messageId, ts: 200 })

    const lines = dest.text.split('\n').filter((l) => l.length > 0)
    // "Hello, world!" = 13 chars / 5 = 3 chunks (5+5+3)
    expect(lines).toHaveLength(4)

    // All chunk events share the same `id`
    for (let i = 0; i < 3; i++) {
      const parsed = JSON.parse(lines[i])
      expect(parsed.type).toBe('message.assistant')
      expect(parsed.id).toBe(messageId)
    }

    // Concatenate deltas to verify reassembly
    const reconstructed = lines
      .slice(0, 3)
      .map((l) => JSON.parse(l).delta)
      .join('')
    expect(reconstructed).toBe('Hello, world!')

    expect(JSON.parse(lines[3]).type).toBe('message.assistant.done')
  })

  test('tool.call and tool.result events carry their payloads', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({ destination: dest, isTTY: false })

    emitter.emit({
      v: 1,
      type: 'tool.call',
      id: 'tc-1',
      name: 'read_files',
      args: { paths: ['/tmp/x.ts'] },
      ts: 1,
    })
    emitter.emit({
      v: 1,
      type: 'tool.result',
      id: 'tc-1',
      name: 'read_files',
      result: { content: 'export const x = 1\n' },
      ts: 2,
    })

    const lines = dest.text.split('\n').filter((l) => l.length > 0)
    const call = JSON.parse(lines[0])
    const result = JSON.parse(lines[1])
    expect(call.name).toBe('read_files')
    expect(call.args.paths).toEqual(['/tmp/x.ts'])
    expect(result.name).toBe('read_files')
    expect(result.result.content).toContain('export const x = 1')
  })

  test('error event includes message and optional code', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({ destination: dest, isTTY: false })

    emitter.emit({
      v: 1,
      type: 'error',
      message: 'Network timeout',
      code: 'ETIMEDOUT',
      ts: 100,
    })

    const parsed = JSON.parse(dest.text.trim())
    expect(parsed.type).toBe('error')
    expect(parsed.message).toBe('Network timeout')
    expect(parsed.code).toBe('ETIMEDOUT')
  })

  test('session.end with usage payload', () => {
    const dest = new CollectWritable()
    const emitter = new StreamJsonEmitter({ destination: dest, isTTY: false })

    emitter.emit({
      v: 1,
      type: 'session.end',
      reason: 'complete',
      usage: { input: 100, output: 50 },
      ts: 999,
    })

    const parsed = JSON.parse(dest.text.trim())
    expect(parsed.type).toBe('session.end')
    expect(parsed.reason).toBe('complete')
    expect(parsed.usage).toEqual({ input: 100, output: 50 })
  })

  test('isInteractive reflects the TTY hint', () => {
    const ttyEmitter = new StreamJsonEmitter({ isTTY: true })
    const nonTtyEmitter = new StreamJsonEmitter({ isTTY: false })
    expect(ttyEmitter.isInteractive()).toBe(true)
    expect(nonTtyEmitter.isInteractive()).toBe(false)
  })
})

describe('createStdoutEmitter', () => {
  test('returns a StreamJsonEmitter instance', () => {
    const emitter = createStdoutEmitter()
    expect(emitter).toBeInstanceOf(StreamJsonEmitter)
  })
})
