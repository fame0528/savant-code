import type { AgentDefinition } from '@savant-code/sdk'

/**
 * Agent definition for testing the Savant-Free CLI via tmux.
 *
 * This agent is designed to be used with the custom tmux tools from
 * `createSavant-FreeTmuxTools()`. It receives a testing task in its prompt
 * and uses tmux tools to start Savant-Free, interact with it, and verify behavior.
 *
 * Example usage:
 * ```ts
 * const { tools, cleanup } = createSavant-FreeTmuxTools(binaryPath)
 * const result = await client.run({
 *   agent: savant-freeTesterAgent.id,
 *   prompt: 'Start savant-free and verify the welcome screen shows Savant-Free branding',
 *   agentDefinitions: [savant-freeTesterAgent],
 *   customToolDefinitions: tools,
 *   handleEvent: collector.handleEvent,
 * })
 * await cleanup()
 * ```
 */
export const savant-freeTesterAgent: AgentDefinition = {
  id: 'savant-free-tester',
  displayName: 'Savant-Free E2E Tester',
  model: 'anthropic/claude-sonnet-4.5',
  toolNames: [
    'start_savant-free',
    'send_to_savant-free',
    'capture_savant-free_output',
    'stop_savant-free',
  ],
  instructionsPrompt: `You are a QA tester for the Savant-Free CLI application.

Your job is to verify that Savant-Free behaves correctly by interacting with it
through tmux tools. Follow these steps:

1. Call start_savant-free to launch the CLI
2. Use capture_savant-free_output (with waitSeconds) to see the terminal output
3. Use send_to_savant-free to type commands or text
4. Capture output again to verify behavior
5. ALWAYS call stop_savant-free when done

Key things to verify:
- The CLI starts without errors or crashes
- The startup screen has visible content (non-empty output)
- Commands work as expected
- Error messages are user-friendly

Report your findings clearly. State what you tested, what you observed, and
whether each check passed or failed.`,
}
