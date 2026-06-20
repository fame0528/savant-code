import { createStdoutEmitter } from '@savant-code/sdk'
import type { StreamEvent } from '@savant-code/sdk'

/**
 * CLI handler for stream-JSON output mode (FID-2026-0620-006).
 *
 * This is a minimal viable implementation: when `--output-format stream-json`
 * is set (or auto-detected from non-TTY stdout), the CLI skips the TUI
 * renderer entirely and emits NDJSON events to stdout.
 *
 * For v0.1, this:
 * 1. Emits `session.start` with a placeholder session id
 * 2. Echoes the initial prompt as `message.user` (if provided)
 * 3. Calls a placeholder agent run loop (delegates to a future SDK call)
 * 4. Emits `session.end` with `complete` status
 *
 * v0.1+ will replace the placeholder loop with a real `SavantClient.run()`
 * that streams events through `handleEvent`.
 */
export async function runStreamJsonMode(options: {
  initialPrompt: string | null
  cwd: string
  agent: string
  model: string
}): Promise<number> {
  const emitter = createStdoutEmitter()
  const sessionId = crypto.randomUUID()

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

  // 3. Run the agent (placeholder — see FID-2026-0620-006 v0.1+ roadmap)
  try {
    await placeholderAgentRun({
      emitter,
      sessionId,
      prompt: options.initialPrompt ?? '',
    })
  } catch (err) {
    const errorEvent: StreamEvent = {
      v: 1,
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
      ts: Date.now(),
    }
    emitter.emit(errorEvent)
    emitter.emit({
      v: 1,
      type: 'session.end',
      reason: 'error',
      ts: Date.now(),
    })
    await emitter.flush()
    return 1
  }

  // 4. session.end (success)
  emitter.emit({
    v: 1,
    type: 'session.end',
    reason: 'complete',
    ts: Date.now(),
  })
  await emitter.flush()
  return 0
}

/**
 * Placeholder agent run — emits a single assistant message acknowledging
 * the prompt. The real implementation will be wired up in v0.1+ once
 * `SavantClient.run()` exposes a streaming event callback that maps to
 * the StreamEvent schema.
 *
 * For now, this just echoes "Savant-Code stream-json mode v0.1 active."
 * so the end-to-end pipe works for CI verification.
 */
async function placeholderAgentRun(params: {
  emitter: ReturnType<typeof createStdoutEmitter>
  sessionId: string
  prompt: string
}): Promise<void> {
  const { emitter } = params
  const messageId = crypto.randomUUID()

  const reply = params.prompt
    ? `[stream-json v0.1] Received prompt: "${params.prompt.slice(0, 50)}${params.prompt.length > 50 ? '...' : ''}". Agent run will be wired up in v0.1+ when SavantClient.run() exposes streaming events.`
    : '[stream-json v0.1] No prompt provided. Use the initial prompt argument to send a message.'

  // Chunked: split into ~10-char deltas (Q10)
  const chunkSize = 10
  for (let i = 0; i < reply.length; i += chunkSize) {
    emitter.emit({
      v: 1,
      type: 'message.assistant',
      id: messageId,
      delta: reply.slice(i, i + chunkSize),
      ts: Date.now(),
    })
  }

  emitter.emit({
    v: 1,
    type: 'message.assistant.done',
    id: messageId,
    ts: Date.now(),
  })
}
