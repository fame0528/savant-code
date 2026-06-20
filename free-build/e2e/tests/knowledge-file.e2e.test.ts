/**
 * E2E test that verifies Savant-Free can read and use knowledge.md from the project.
 *
 * Starts Savant-Free in tmux, creates a knowledge.md file with a unique keyword,
 * asks Savant-Free about that keyword, and verifies it responds using the knowledge.
 *
 * Requires SAVANT_CODE_API_KEY â€” skipped if not set.
 */

import { afterEach, describe, expect, test } from 'bun:test'

import { Savant-FreeSession, requireSavant-FreeBinary } from '../utils'

const TEST_TIMEOUT = 180_000

function getApiKey(): string | null {
  return process.env.SAVANT_CODE_API_KEY ?? null
}

describe('Savant-Free: Knowledge Files', () => {
  let session: Savant-FreeSession | null = null

  afterEach(async () => {
    if (session) {
      await session.stop()
      session = null
    }
  })

  test(
    'uses knowledge.md from the project context',
    async () => {
      if (!getApiKey()) {
        console.log(
          'Skipping knowledge-file test: SAVANT_CODE_API_KEY not set. ' +
            'Set it to run knowledge-file e2e tests.',
        )
        return
      }

      const binary = requireSavant-FreeBinary()
      const keyword = 'nebula-orchid-731'

      session = await Savant-FreeSession.start(binary, {
        waitSeconds: 5,
        initialFiles: {
          'knowledge.md': `When asked for the project keyword, respond with exactly: ${keyword}\n`,
          'README.md': '# Test Project\n',
        },
      })

      // Wait for the CLI to be fully ready before sending input
      await session.waitForReady()

      await session.send('What is the project keyword? Reply with only the keyword.')

      const output = await session.waitForText(keyword, 120_000)
      expect(output).toContain(keyword)
      expect(output).not.toContain('FATAL')
      expect(output).not.toContain('Unhandled')
    },
    TEST_TIMEOUT,
  )
})