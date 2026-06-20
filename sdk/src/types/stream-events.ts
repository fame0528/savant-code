/**
 * Stream-JSON event schema (FID-2026-0620-006).
 *
 * Emitted by the CLI when `--output-format stream-json` is set, or
 * automatically when stdout is not a TTY. One JSON object per line
 * (NDJSON format), each carrying a `v: 1` schema version field.
 *
 * Per Q9, the `v` field is present on every event for forward-compat.
 * Per Q10, `message.assistant` events are CHUNKED (one event per delta).
 *
 * Exit codes (per Q11):
 * - 0 on `session.end: complete`
 * - 1 on `error` or `session.end: cancelled`
 */

export const STREAM_JSON_SCHEMA_VERSION = 1 as const

export type StreamEventType =
  | 'session.start'
  | 'message.user'
  | 'message.assistant'
  | 'message.assistant.done'
  | 'tool.call'
  | 'tool.result'
  | 'error'
  | 'session.end'

export type StreamEvent = {
  v: typeof STREAM_JSON_SCHEMA_VERSION
  type: StreamEventType
  ts: number
} & (
  | {
      type: 'session.start'
      sessionId: string
      agent: string
      model: string
    }
  | {
      type: 'message.user'
      id: string
      content: string
    }
  | {
      type: 'message.assistant'
      id: string
      delta: string
    }
  | {
      type: 'message.assistant.done'
      id: string
    }
  | {
      type: 'tool.call'
      id: string
      name: string
      args: unknown
    }
  | {
      type: 'tool.result'
      id: string
      name: string
      result: unknown
    }
  | {
      type: 'error'
      message: string
      code?: string
    }
  | {
      type: 'session.end'
      reason: 'complete' | 'cancelled' | 'error'
      usage?: { input: number; output: number }
    }
)
