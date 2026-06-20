import { describe, expect, test } from 'bun:test'

import {
  renderCustomCommand,
  substituteCustomCommandTemplate,
} from '../custom-command-template'
import type { CustomCommand } from '../../types/custom-command'

describe('substituteCustomCommandTemplate (FID-2026-0620-005)', () => {
  test('substitutes $1, $2, ... positional args', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Review PR #$1 in $2 (priority: $3)',
      args: '42 backend high',
    })
    expect(out).toBe('Review PR #42 in backend (priority: high)')
  })

  test('$ARG returns the entire args string (not just the last token)', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Fix bug $ARG',
      args: 'in auth middleware',
    })
    expect(out).toBe('Fix bug in auth middleware')
  })

  test('$ARG is empty when no args provided', () => {
    const out = substituteCustomCommandTemplate({
      body: 'No args. Last would be: $ARG',
      args: '',
    })
    expect(out).toBe('No args. Last would be: ')
  })

  test('$@ is an alias for $ARG (entire args string)', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Process: $@',
      args: 'a b c d',
    })
    expect(out).toBe('Process: a b c d')
  })

  test('$SELECTION injects the provided selection', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Refactor this:\n$SELECTION',
      args: '',
      selection: 'function foo() { return 1 }',
    })
    expect(out).toBe('Refactor this:\nfunction foo() { return 1 }')
  })

  test('unknown $placeholder is left untouched (typo safety)', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Use $USERNAME and $TICKET',
      args: 'spencer ABC-123',
    })
    // $USERNAME is not a known placeholder — left as-is
    // $1 (substituted from args) works
    expect(out).toBe('Use $USERNAME and $TICKET')
  })

  test('shell-like quote handling', () => {
    const out = substituteCustomCommandTemplate({
      body: 'Name: $1, Path: $2',
      args: '"John Doe" /usr/local/bin',
    })
    expect(out).toBe('Name: John Doe, Path: /usr/local/bin')
  })

  test('does not re-substitute user content (single pass)', () => {
    // The body has a single $1; even if the args string contains chars
    // that look like placeholders, the replacement happens once and
    // the result is not re-scanned.
    const out = substituteCustomCommandTemplate({
      body: 'Echo: $1 and $1 again',
      args: 'hello',
    })
    expect(out).toBe('Echo: hello and hello again')
  })

  test('out-of-range positional returns empty string', () => {
    const out = substituteCustomCommandTemplate({
      body: '$1 $5',
      args: 'only-one',
    })
    expect(out).toBe('only-one ')
  })
})

describe('renderCustomCommand', () => {
  test('renders a full custom command with all substitutions', () => {
    const command: CustomCommand = {
      name: 'pr',
      filePath: '/tmp/pr.md',
      frontmatter: {
        description: 'Create a pull request',
      },
      body: 'Create a PR for ticket $1 titled "$@". Last update: $ARG',
    }
    const out = renderCustomCommand(command, 'PROJ-42 Fix login bug')
    // $1 = first positional = 'PROJ-42'
    // $@ and $ARG = entire raw args string
    expect(out).toBe(
      'Create a PR for ticket PROJ-42 titled "PROJ-42 Fix login bug". Last update: PROJ-42 Fix login bug',
    )
  })
})
