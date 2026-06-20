import { createRequire } from 'module'

import { Argument, Command } from 'commander'

import { IS_SAVANT_FREE, type AgentMode } from './utils/constants'
import { getCliEnv } from './utils/env'

const require = createRequire(import.meta.url)

export type ParsedArgs = {
  initialPrompt: string | null
  command?: string
  agent?: string
  clearLogs: boolean
  continue: boolean
  continueId?: string | null
  cwd?: string
  initialMode?: AgentMode
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
  isSavant-Free = IS_SAVANT_FREE,
  version = loadPackageVersion(),
}: {
  argv?: string[]
  isSavant-Free?: boolean
  version?: string
} = {}): ParsedArgs {
  const program = new Command()

  if (isSavant-Free) {
    // Savant-Free: simplified CLI - no prompt args, no agent override, no clear-logs
    program
      .name('savant-free')
      .description('Savant-Free - Free AI coding assistant')
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
    // Savant-Code: full CLI with all options
    program
      .name('savant-code')
      .description('Savant-Code CLI - AI-powered coding assistant')
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
  // Savant-Free always uses LITE mode
  let initialMode: AgentMode | undefined
  if (isSavant-Free) {
    initialMode = 'LITE'
  } else {
    if (options.free || options.lite) initialMode = 'LITE'
    if (options.max) initialMode = 'MAX'
    if (options.plan) initialMode = 'PLAN'
  }

  return {
    initialPrompt: !isSavant-Free && args.length > 0 ? args.join(' ') : null,
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
  }
}
