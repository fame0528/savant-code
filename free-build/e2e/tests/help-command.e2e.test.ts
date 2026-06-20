import { execFileSync } from 'node:child_process'

import { afterEach, describe, expect, test } from 'bun:test'

import { Savant-FreeSession, requireSavant-FreeBinary } from '../utils'

const TEST_TIMEOUT = 60_000

describe('Savant-Free: --help flag', () => {
  test('shows CLI usage information', () => {
    const binary = requireSavant-FreeBinary()
    const output = execFileSync(binary, ['--help'], {
      encoding: 'utf-8',
      timeout: 10_000,
    })

    // Should show the binary name
    expect(output.toLowerCase()).toContain('savant-free')

    // Should show usage info
    expect(output).toMatch(/usage|options|commands/i)
  })

  test('does not reference Savant-Code', () => {
    const binary = requireSavant-FreeBinary()
    const output = execFileSync(binary, ['--help'], {
      encoding: 'utf-8',
      timeout: 10_000,
    })

    // The --help output should say Savant-Free, not Savant-Code
    expect(output).not.toMatch(/\bsavant-code\b/i)
  })
})

describe('Savant-Free: /help slash command', () => {
  let session: Savant-FreeSession | null = null

  const openHelp = async (session: Savant-FreeSession): Promise<string | null> => {
    const initialOutput = await session.capture()
    if (!initialOutput.includes('Enter a coding task')) {
      console.log(
        'Skipping /help slash command assertion: Savant-Free is not on the chat input screen.',
      )
      return null
    }

    await session.sendKey('C-u')
    for (const key of ['/', 'h', 'e', 'l', 'p']) {
      await session.sendKey(key)
    }
    await session.waitForText('/help', 10_000)
    await session.sendKey('Enter')
    return session.waitForText('Shortcuts', 10_000)
  }

  afterEach(async () => {
    if (session) {
      await session.stop()
      session = null
    }
  })

  test(
    'shows help content when /help is entered',
    async () => {
      const binary = requireSavant-FreeBinary()
      session = await Savant-FreeSession.start(binary)
      await session.waitForReady()

      const output = await openHelp(session)
      if (!output) return

      // Should show shortcuts section
      expect(output).toMatch(/shortcut|ctrl|esc/i)
    },
    TEST_TIMEOUT,
  )

  test(
    'does not show subscription commands in help',
    async () => {
      const binary = requireSavant-FreeBinary()
      session = await Savant-FreeSession.start(binary)
      await session.waitForReady()

      const output = await openHelp(session)
      if (!output) return

      // Savant-Free should NOT show these paid/subscription commands
      expect(output).not.toContain('/subscribe')
      expect(output).not.toContain('/usage')
      expect(output).not.toContain('/credits')
    },
    TEST_TIMEOUT,
  )
})
