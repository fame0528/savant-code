/**
 * Custom slash command constants and validation rules.
 *
 * FID-2026-0620-005 — Custom slash commands.
 *
 * Users can drop `.md` files into `.savant/commands/` (project) or
 * `~/.savant/commands/` (global) to define reusable slash commands.
 * Each `.md` file becomes a `/<filename-without-ext>` command.
 */

/**
 * Directory names where custom commands are searched.
 * Project overrides global; `.SavantCode` is the legacy alias kept for
 * backwards compatibility with the prior codename.
 */
export const CUSTOM_COMMANDS_DIRS = [
  '.savant/commands',
  '.SavantCode/commands',
] as const

/**
 * Allowed file extension for custom commands.
 * Markdown is the only supported format (frontmatter + body).
 */
export const CUSTOM_COMMANDS_EXTENSION = '.md'

/**
 * Maximum number of custom commands allowed per project (defensive cap
 * to prevent accidental directory enumeration from running amok).
 */
export const CUSTOM_COMMANDS_MAX_PER_DIR = 200

/**
 * Recursion depth limit: a custom command CANNOT invoke another custom
 * command. This prevents accidental prompt-injection loops.
 */
export const CUSTOM_COMMANDS_MAX_RECURSION_DEPTH = 0

/**
 * The env var that, when set to `1`, enables strict mode — only commands
 * listed in `~/.savant/allowlist.json` are loaded; others are skipped with
 * a warning. Use this in untrusted environments (CI, shared machines).
 */
export const STRICT_COMMANDS_ENV_VAR = 'SAVANT_CODE_STRICT_COMMANDS'
