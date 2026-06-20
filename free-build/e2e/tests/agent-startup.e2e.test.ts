/**
 * Agent-driven E2E test for Savant-Free.
 *
 * Uses the Savant-Code SDK to run a testing agent that interacts with the
 * Savant-Free CLI binary via tmux custom tools. Requires SAVANT_CODE_API_KEY.
 *
 * Set SAVANT_CODE_API_KEY to run this test, otherwise it will be skipped.
 */

import { afterEach, describe, expect, test } from 'bun:test'

import { savant-freeTesterAgent } from '../agent/savant-free-tester'
import { createSavant-FreeTmuxTools, requireSavant-FreeBinary } from '../utils'

import type { SavantClient as SavantClientType } from '@savant-code/sdk'

const AGENT_TEST_TIMEOUT = 180_000

function getApiKey(): string | null {
  return process.env.SAVANT_CODE_API_KEY ?? null
}

describe('Savant-Free: Agent-driven E2E', () => {
  let cleanup: (() => Promise<void>) | null = null

  afterEach(async () => {
    if (cleanup) {
      await cleanup()
      cleanup = null
    }
  })

  test(
    'agent can start savant-free and verify startup behavior',
    async () => {
      const apiKey = getApiKey()
      if (!apiKey) {
        console.log(
          'Skipping agent test: SAVANT_CODE_API_KEY not set. ' +
            'Set it to run agent-driven e2e tests.',
        )
        return
      }

      const binary = requireSavant-FreeBinary()
      const tmuxTools = createSavant-FreeTmuxTools(binary)
      cleanup = tmuxTools.cleanup

      // Dynamically import SDK to avoid build-time dependency issues
      const { SavantClient } = (await import(
        '@savant-code/sdk'
      )) as typeof import('@savant-code/sdk')

      const client: SavantClientType = new SavantClient({ apiKey })

      const events: Array<{ type: string; [key: string]: unknown }> = []

      const result = await client.run({
        agent: savant-freeTesterAgent.id,
        prompt:
          'Start Savant-Free using the start_savant-free tool. Then capture the output ' +
          'with capture_savant-free_output (waitSeconds: 3). Verify that:\n' +
          '1. The CLI started without errors (no FATAL, panic, or crash messages)\n' +
          '2. The output has visible content (not a blank screen)\n' +
          'Finally, call stop_savant-free to clean up. Report your findings.',
        agentDefinitions: [savant-freeTesterAgent],
        customToolDefinitions: tmuxTools.tools,
        handleEvent: (event) => {
          events.push(event)
        },
      })

      expect(result.output.type).not.toBe('error')

      // Verify the agent exercised the startup path. The afterEach cleanup
      // handles stopping Savant-Free deterministically if the agent finishes early.
      const toolCalls = events.filter((e) => e.type === 'tool_call')
      const toolNames = toolCalls.map((e) => e.toolName)
      expect(toolNames).toContain('start_savant-free')
      expect(toolNames).toContain('capture_savant-free_output')
    },
    AGENT_TEST_TIMEOUT,
  )

  test(
    'agent can send commands and verify output',
    async () => {
      const apiKey = getApiKey()
      if (!apiKey) {
        console.log('Skipping agent test: SAVANT_CODE_API_KEY not set.')
        return
      }

      const binary = requireSavant-FreeBinary()
      const tmuxTools = createSavant-FreeTmuxTools(binary)
      cleanup = tmuxTools.cleanup

      const { SavantClient } = (await import(
        '@savant-code/sdk'
      )) as typeof import('@savant-code/sdk')

      const client: SavantClientType = new SavantClient({ apiKey })

      const result = await client.run({
        agent: savant-freeTesterAgent.id,
        prompt:
          'Start Savant-Free, wait for it to load (capture with waitSeconds: 5), ' +
          'then send the "/help" command using send_to_savant-free. ' +
          'Capture the output after 2 seconds. ' +
          'Verify the help content is displayed. ' +
          'Stop Savant-Free when done and report your findings.',
        agentDefinitions: [savant-freeTesterAgent],
        customToolDefinitions: tmuxTools.tools,
        handleEvent: () => {},
      })

      expect(result.output.type).not.toBe('error')
    },
    AGENT_TEST_TIMEOUT,
  )
})
