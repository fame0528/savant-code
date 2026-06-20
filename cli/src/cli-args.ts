import { createRequire } from 'module'

import { Argument, Command } from 'commander'

import { IS_SAVANT_FREE, type AgentMode } from './utils/constants'
import { getCliEnv } from './utils/env'

const require = createRequire(import.meta.url)

export type OutputFormat = 'tui' | 'stream-json'

export type ParsedArgs = {
  initialPrompt: string | null
  command?: string
  agent?: string
  clearLogs: boolean
  continue: boolean
  continueId?: string | null
  cwd?: string
  initialMode?: AgentMode
  outputFormat: OutputFormat
}

export function loadPackageVersion(): string {
  const env = getCliEnv()
  if (env.SAVANT_CODE_CLI_VERSION) {
    return env.SAVANT_CODE_CLI_VERSION
  }

  try {
    const pkg = require('../package.json') as { version?: string }
    if (pkg.version) {
      return pkg.version
    }
  } catch {
    // Continue to dev fallback
  }

  return 'dev'
}

export function parseArgs({
  argv = process.argv,
  isSavantFree = IS_SAVANT_FREE,
  version = loadPackageVersion(),
}: {
  argv?: string[]
  isSavantFree?: boolean
  version?: string
} = {}): ParsedArgs {
  const program = new Command()

  if (isSavantFree) {
    // SavantFree: simplified CLI - no prompt args, no agent override, no clear-logs
    program
      .name('SavantFree')
      .description('SavantFree - Free AI coding assistant')
      .version(version, '-v, --version', 'Print the CLI version')
      .option(
        '--continue [conversation-id]',
        'Continue from a previous conversation (optionally specify a conversation id)',
      )
      .option(
        '--cwd <directory>',
        'Set the working directory (default: current directory)',
      )
      .addArgument(
        new Argument('[command]', 'Command to run').choices(['login']),
      )
      .helpOption('-h, --help', 'Show this help message')
  } else {
    // SavantCode: full CLI with all options
    program
      .name('SavantCode')
      .description('SavantCode CLI - AI-powered coding assistant')
      .version(version, '-v, --version', 'Print the CLI version')
      .option(
        '--agent <agent-id>',
        'Run a specific agent id (skips loading local .agents overrides)',
      )
      .option(
        '--clear-logs',
        'Remove any existing CLI log files before starting',
      )
      .option(
        '--continue [conversation-id]',
        'Continue from a previous conversation (optionally specify a conversation id)',
      )
      .option(
        '--cwd <directory>',
        'Set the working directory (default: current directory)',
      )
      .option(
        '--output-format <format>',
        'Output format (FID-2026-0620-006): "tui" (default, interactive) or "stream-json" (NDJSON to stdout, for CI/scripting). Auto-detected when stdout is not a TTY.',
      )
      .option('--lite', 'Start in LITE mode')
      .option('--free', 'Start in LITE mode (deprecated alias)')
      .option('--max', 'Start in MAX mode')
      .option('--plan', 'Start in PLAN mode')
      .addHelpText(
        'after',
        '\nCommands:\n  login                          Log in to your account\n  publish                        Publish agents to the registry',
      )
      .helpOption('-h, --help', 'Show this help message')
      .argument('[prompt...]', 'Initial prompt to send to the agent')
      .allowExcessArguments(true)
  }

  program.parse(argv)

  const options = program.opts()
  const args = program.args

  const continueFlag = options.continue

  // Determine initial mode from flags (last flag wins if multiple specified)
  // SavantFree always uses LITE mode
  let initialMode: AgentMode | undefined
  if (isSavantFree) {
    initialMode = 'LITE'
  } else {
    if (options.free || options.lite) initialMode = 'LITE'
    if (options.max) initialMode = 'MAX'
    if (options.plan) initialMode = 'PLAN'
  }

  return {
    initialPrompt: !isSavantFree && args.length > 0 ? args.join(' ') : null,
    command: args[0],
    agent: options.agent,
    clearLogs: options.clearLogs || false,
    continue: Boolean(continueFlag),
    continueId:
      typeof continueFlag === 'string' && continueFlag.trim().length > 0
        ? continueFlag.trim()
        : null,
    cwd: options.cwd,
    initialMode,
    // FID-2026-0620-006 — stream-JSON output mode. Auto-detect TTY per Q11.
    outputFormat: resolveOutputFormat(options.outputFormat),
  }
}

/**
 * Resolves the effective output format, applying TTY auto-detection.
 *
 * FID-2026-0620-006 — Q11: "Should TUI mode auto-fallback to stream-json
 * when stdout is not a TTY? My recommendation: yes, auto-detect."
 */
function resolveOutputFormat(explicit?: string): OutputFormat {
  if (explicit === 'stream-json') return 'stream-json'
  if (explicit === 'tui') return 'tui'
  // Auto-detect: if stdout is not a TTY, default to stream-json so
  // pipelines (`SavantCode ... | jq`, redirects to file) work out of
  // the box without explicit flags.
  if (!process.stdout.isTTY) return 'stream-json'
  return 'tui'
}
