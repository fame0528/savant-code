import fs from 'fs'
import os from 'os'
import path from 'path'

import {
  CUSTOM_COMMANDS_DIRS,
  CUSTOM_COMMANDS_EXTENSION,
  CUSTOM_COMMANDS_MAX_PER_DIR,
  STRICT_COMMANDS_ENV_VAR,
} from '@savant-code/common/constants/commands'
import {
  CustomCommandFrontmatterSchema,
  isCustomCommandFile,
  type CustomCommand,
  type CustomCommandsMap,
} from '@savant-code/common/types/custom-command'
import matter from 'gray-matter'

import { getProjectRoot } from '../project-files'
import { logger } from './logger'

/**
 * Loads custom slash commands from .savant/commands/ and
 * .savant-code/commands/ directories (FID-2026-0620-005).
 *
 * Search roots (later overrides earlier):
 * - ~/.savant/commands/   (global)
 * - ~/.savant-code/commands/  (legacy alias)
 * - {cwd}/.savant/commands/   (project, highest priority)
 * - {cwd}/.savant-code/commands/  (project, legacy alias)
 *
 * Each `.md` file becomes a `/<filename-without-ext>` command. YAML
 * frontmatter is strict (Zod-validated); invalid files are skipped
 * with a warning (no silent corruption).
 *
 * Built-in commands always win on collision (project command
 * overrides global command, but neither overrides a built-in).
 */
export async function loadCustomCommands(options: {
  cwd?: string
  verbose?: boolean
} = {}): Promise<CustomCommandsMap> {
  const cwd = options.cwd ?? getProjectRoot() ?? process.cwd()
  const verbose = options.verbose ?? false
  const home = os.homedir()

  const commands: CustomCommandsMap = {}
  const strict = process.env[STRICT_COMMANDS_ENV_VAR] === '1'
  const allowlist = strict ? loadStrictAllowlist(home) : null

  // Build full search path list (global + project)
  const searchDirs: string[] = []
  for (const rel of CUSTOM_COMMANDS_DIRS) {
    searchDirs.push(path.join(home, rel))
    searchDirs.push(path.join(cwd, rel))
  }

  for (const dir of searchDirs) {
    const fromDir = readCommandsFromDir(dir, verbose)
    for (const [name, cmd] of Object.entries(fromDir)) {
      // Built-in collision check (Q5 — built-ins always win)
      if (BUILTIN_COMMAND_NAMES.has(name)) {
        if (verbose) {
          logger.warn(
            { command: name, path: cmd.filePath },
            'Custom command name collides with built-in; skipping',
          )
        }
        continue
      }

      // Strict mode allowlist check
      if (strict && allowlist && !allowlist.has(name)) {
        if (verbose) {
          logger.warn(
            { command: name },
            'Custom command not in strict allowlist; skipping (set SAVANT_CODE_STRICT_COMMANDS=0 to disable)',
          )
        }
        continue
      }

      // First-load warning for non-strict mode (Q8 — warn on first load)
      warnFirstLoad(name, cmd.filePath)

      // Later directories override earlier (project overrides global)
      commands[name] = cmd
    }
  }

  return commands
}

// ============================================================================
// Internal
// ============================================================================

/**
 * Built-in command IDs that custom commands CANNOT override.
 * This list mirrors the `id` field of every SlashCommand in
 * `cli/src/data/slash-commands.ts`. Keep in sync.
 */
const BUILTIN_COMMAND_NAMES: Set<string> = new Set([
  'help', 'connect', 'ads:enable', 'ads:disable', 'init', 'usage',
  'subscribe', 'interview', 'plan', 'review', 'new', 'history',
  'agent:gpt-5', 'feedback', 'bash', 'image', 'theme:toggle',
  'end-session', 'logout', 'exit',
])

/** First-load tracking: map of command-name -> first-seen file path */
const FIRST_LOAD_SEEN: Map<string, string> = new Map()

function warnFirstLoad(name: string, filePath: string): void {
  if (FIRST_LOAD_SEEN.has(name)) return
  FIRST_LOAD_SEEN.set(name, filePath)
  // First load: surface a one-time warning to stderr (not the TUI)
  process.stderr.write(
    `[savant-code] loaded custom command /${name} from ${filePath}\n`,
  )
}

function loadStrictAllowlist(home: string): Set<string> | null {
  const allowlistPath = path.join(home, '.savant', 'allowlist.json')
  try {
    const content = fs.readFileSync(allowlistPath, 'utf8')
    const parsed = JSON.parse(content) as { commands?: string[] }
    if (Array.isArray(parsed.commands)) {
      return new Set(parsed.commands)
    }
    logger.warn(
      { allowlistPath },
      'allowlist.json exists but has no "commands" array; treating as empty',
    )
    return new Set()
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.warn(
        { allowlistPath },
        'SAVANT_CODE_STRICT_COMMANDS=1 set but allowlist.json not found; no custom commands will load',
      )
      return new Set()
    }
    logger.warn({ err }, 'Failed to read allowlist.json')
    return null
  }
}

function readCommandsFromDir(
  dir: string,
  verbose: boolean,
): CustomCommandsMap {
  const out: CustomCommandsMap = {}

  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return out
  }

  let count = 0
  for (const entry of entries) {
    if (count >= CUSTOM_COMMANDS_MAX_PER_DIR) {
      logger.warn(
        { dir, max: CUSTOM_COMMANDS_MAX_PER_DIR },
        'Custom command directory hit max cap; ignoring remaining files',
      )
      break
    }
    if (!isCustomCommandFile(entry)) continue

    const filePath = path.join(dir, entry)
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) continue

    const cmd = readCommandFromFile(filePath, verbose)
    if (cmd) {
      out[cmd.name] = cmd
      count++
    }
  }

  return out
}

function readCommandFromFile(
  filePath: string,
  verbose: boolean,
): CustomCommand | null {
  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    if (verbose) {
      logger.warn({ err, filePath }, 'Failed to read custom command file')
    }
    return null
  }

  let frontmatter: Record<string, unknown> = {}
  let body = raw
  try {
    const parsed = matter(raw)
    if (parsed.data && Object.keys(parsed.data).length > 0) {
      frontmatter = parsed.data as Record<string, unknown>
    }
    body = parsed.content.trim()
  } catch {
    // No frontmatter is OK; body is the whole file
  }

  // Strict Zod validation per Q5
  const result = CustomCommandFrontmatterSchema.safeParse(frontmatter)
  if (!result.success) {
    logger.warn(
      { filePath, issues: result.error.issues },
      'Invalid custom command frontmatter; skipping file',
    )
    return null
  }

  const name = path.basename(filePath, CUSTOM_COMMANDS_EXTENSION)
  // Validate the command name (same rules as skill names — lowercase
  // alphanumeric with single hyphen separators)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    logger.warn(
      { name, filePath },
      'Custom command name must be lowercase alphanumeric with single hyphens; skipping',
    )
    return null
  }

  return {
    name,
    filePath,
    frontmatter: result.data,
    body,
  }
}

/**
 * Clear the first-load cache. Intended for tests.
 */
export function __resetCustomCommandCacheForTests(): void {
  FIRST_LOAD_SEEN.clear()
}
