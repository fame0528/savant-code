import { z } from 'zod/v4'

import { Savant-FreeSession } from './savant-free-session'

import type { ZodType } from 'zod/v4'

interface Savant-FreeToolDefinition {
  toolName: string
  description: string
  inputSchema: ZodType
  endsAgentStep: boolean
  exampleInputs: Record<string, unknown>[]
  execute: (input: Record<string, unknown>) => Promise<ToolOutput>
}

type ToolOutput = { type: 'json'; value: Record<string, unknown> }[]

/**
 * Creates custom tool definitions that allow a Savant-Code SDK agent
 * to interact with a Savant-Free CLI binary via tmux.
 *
 * Returns the tools array and a cleanup function to call in afterEach.
 *
 * Usage:
 * ```ts
 * const { tools, cleanup } = createSavant-FreeTmuxTools(binaryPath)
 * // ... pass tools to client.run({ customToolDefinitions: tools })
 * // ... in afterEach: await cleanup()
 * ```
 */
export function createSavant-FreeTmuxTools(binaryPath: string): {
  tools: Savant-FreeToolDefinition[]
  cleanup: () => Promise<void>
} {
  let session: Savant-FreeSession | null = null

  const startTool: Savant-FreeToolDefinition = {
    toolName: 'start_savant-free',
    description:
      'Start the Savant-Free CLI binary in a tmux terminal session. Call this first before interacting with Savant-Free.',
    inputSchema: z.object({}),
    endsAgentStep: true,
    exampleInputs: [{}],
    execute: async (): Promise<ToolOutput> => {
      if (session) {
        return [
          {
            type: 'json',
            value: {
              error: 'Session already running',
              sessionName: session.name,
            },
          },
        ]
      }
      session = await Savant-FreeSession.start(binaryPath)
      await session.waitForReady()
      const initialOutput = await session.capture()
      return [
        {
          type: 'json',
          value: {
            started: true,
            sessionName: session.name,
            initialOutput,
          },
        },
      ]
    },
  }

  const sendInputTool: Savant-FreeToolDefinition = {
    toolName: 'send_to_savant-free',
    description:
      'Send text input to the running Savant-Free CLI. The text is sent as if typed by the user and Enter is pressed.',
    inputSchema: z.object({
      text: z.string().describe('Text to send to Savant-Free'),
    }),
    endsAgentStep: false,
    exampleInputs: [{ text: '/help' }],
    execute: async (input): Promise<ToolOutput> => {
      const text = (input as { text: string }).text
      if (!session) {
        return [
          {
            type: 'json',
            value: { error: 'No session running. Call start_savant-free first.' },
          },
        ]
      }
      await session.send(text)
      return [{ type: 'json', value: { sent: true, text } }]
    },
  }

  const captureOutputTool: Savant-FreeToolDefinition = {
    toolName: 'capture_savant-free_output',
    description:
      'Capture the current terminal output from the running Savant-Free CLI session. ' +
      'Use waitSeconds to wait before capturing (useful after sending a command).',
    inputSchema: z.object({
      waitSeconds: z
        .number()
        .optional()
        .describe('Seconds to wait before capturing (default: 0)'),
    }),
    endsAgentStep: true,
    exampleInputs: [{ waitSeconds: 2 }],
    execute: async (input): Promise<ToolOutput> => {
      const waitSeconds = (input as { waitSeconds?: number }).waitSeconds
      if (!session) {
        return [
          {
            type: 'json',
            value: { error: 'No session running. Call start_savant-free first.' },
          },
        ]
      }
      const output = await session.capture(waitSeconds)
      return [{ type: 'json', value: { output } }]
    },
  }

  const stopTool: Savant-FreeToolDefinition = {
    toolName: 'stop_savant-free',
    description:
      'Stop the running Savant-Free CLI session and clean up resources. Always call this when done testing.',
    inputSchema: z.object({}),
    endsAgentStep: true,
    exampleInputs: [{}],
    execute: async (): Promise<ToolOutput> => {
      if (!session) {
        return [
          { type: 'json', value: { stopped: true, wasRunning: false } },
        ]
      }
      await session.stop()
      session = null
      return [
        { type: 'json', value: { stopped: true, wasRunning: true } },
      ]
    },
  }

  const cleanup = async () => {
    if (session) {
      await session.stop()
      session = null
    }
  }

  return {
    tools: [startTool, sendInputTool, captureOutputTool, stopTool],
    cleanup,
  }
}
