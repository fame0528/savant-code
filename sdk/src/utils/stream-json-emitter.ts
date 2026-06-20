import { Writable } from 'stream'

import type { StreamEvent } from '../types/stream-events'

/**
 * Stream-JSON emitter (FID-2026-0620-006).
 *
 * Writes one NDJSON line per event to the given writable stream (default:
 * process.stdout). Each line is a JSON object with a `v: 1` schema version
 * field, plus the event-specific payload.
 *
 * Thread-safety: this emitter is synchronous (calls `write()` and trusts the
 * underlying stream to buffer). For high-throughput consumers, wrap the
 * destination stream in a buffered writable.
 */
export class StreamJsonEmitter {
  private readonly destination: Writable
  private readonly isTTY: boolean

  constructor(options: { destination?: Writable; isTTY?: boolean } = {}) {
    this.destination = options.destination ?? process.stdout
    this.isTTY = options.isTTY ?? Boolean(process.stdout.isTTY)
  }

  /**
   * Emit a stream event. Serializes the event to JSON and writes one line.
   * Returns `true` if the underlying write was accepted; `false` if the
   * caller should back off.
   */
  emit(event: StreamEvent): boolean {
    return this.destination.write(JSON.stringify(event) + '\n')
  }

  /**
   * Flush the underlying stream (if supported). Returns a promise that
   * resolves when the buffer is drained.
   */
  async flush(): Promise<void> {
    if (typeof (this.destination as { flush?: () => Promise<void> }).flush === 'function') {
      await (this.destination as unknown as { flush: () => Promise<void> }).flush()
    }
  }

  /**
   * Whether the destination is a TTY (used for auto-detection decisions).
   */
  isInteractive(): boolean {
    return this.isTTY
  }
}

/**
 * Helper: create an emitter that writes to stdout, with a TTY-aware
 * constructor.
 */
export function createStdoutEmitter(): StreamJsonEmitter {
  return new StreamJsonEmitter({ destination: process.stdout })
}
