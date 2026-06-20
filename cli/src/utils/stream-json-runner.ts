import {
  SavantClient,
  createStdoutEmitter,
  createMapPrintModeContext,
  mapPrintModeToStream,
} from '@savant-code/sdk'

/**
 * CLI handler for stream-JSON output mode (FID-2026-0620-006, FID-2026-0620-007).
 *
 * When `--output-format stream-json` is set (or auto-detected from non-TTY
 * stdout), the CLI skips the TUI renderer entirely and emits NDJSON events
 * to stdout. v0.2 wires the real `SavantClient.run()` stream (FID-007) to
 * the `StreamEvent` schema via `mapPrintModeToStream`.
 */
export async function runStreamJsonMode(options: {
  initialPrompt: string | null
  cwd: string
  agent: string
  model: string
}): Promise<number> {
  const emitter = createStdoutEmitter()
  const sessionId = crypto.randomUUID()
  const mapContext = createMapPrintModeContext({
    sessionId,
    model: options.model,
    defaultAgent: options.agent,
  })

  // AbortController wired to stdin EOF + SIGINT (Q3 from FID-007)
  const abortController = new AbortController()
  const onStdinEnd = () => abortController.abort()
  const onSigInt = () => abortController.abort()
  let cancelled = false

  process.stdin.on('end', onStdinEnd)
  process.on('SIGINT', onSigInt)
  const cleanup = () => {
    process.stdin.removeListener('end', onStdinEnd)
    process.removeListener('SIGINT', onSigInt)
  }

  // 1. session.start
  emitter.emit({
    v: 1,
    type: 'session.start',
    sessionId,
    agent: options.agent,
    model: options.model,
    ts: Date.now(),
  })

  // 2. echo user prompt
  if (options.initialPrompt) {
    emitter.emit({
      v: 1,
      type: 'message.user',
      id: crypto.randomUUID(),
      content: options.initialPrompt,
      ts: Date.now(),
    })
  }

  // 3. Run the agent via SavantClient
  try {
    const client = new SavantClient({ cwd: options.cwd })
    await client.run({
      agent: options.agent,
      prompt: options.initialPrompt ?? '',
      signal: abortController.signal,
      handleEvent: (printEvent) => {
        const streamEvents = mapPrintModeToStream(printEvent, mapContext)
        for (const ev of streamEvents) {
          emitter.emit(ev)
        }
      },
    })
  } catch (err) {
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || /abort/i.test(err.message))
    if (isAbort) cancelled = true

    if (!cancelled) {
      emitter.emit({
        v: 1,
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        ts: Date.now(),
      })
    }
    emitter.emit({
      v: 1,
      type: 'session.end',
      reason: cancelled ? 'cancelled' : 'error',
      ts: Date.now(),
    })
    cleanup()
    await emitter.flush()
    return 1
  }

  cleanup()
  emitter.emit({
    v: 1,
    type: 'session.end',
    reason: 'complete',
    ts: Date.now(),
  })
  await emitter.flush()
  return 0
}
