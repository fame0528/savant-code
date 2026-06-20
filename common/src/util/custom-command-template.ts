import type { CustomCommand } from '../types/custom-command'

/**
 * Substitutes placeholders in a custom command body (FID-2026-0620-005).
 *
 * Supported placeholders (matches opencode convention):
 * - `$1`, `$2`, ... `$N` — positional arguments (whitespace-separated, like shell)
 * - `$ARG`             — shorthand for the last positional argument
 * - `$@`               — all arguments joined by space (like shell `$@`)
 * - `$SELECTION`       — the user's current selection (or empty string if none)
 *
 * Strict mode:
 * - Unknown `$<word>` placeholders are left untouched (not silently dropped),
 *   so typos in user templates are visible in the final prompt.
 * - All substitutions happen on a single pass to prevent re-substitution
 *   of user content that contains `$1` etc.
 */
export function substituteCustomCommandTemplate(params: {
  body: string
  args: string
  selection?: string
}): string {
  const { body, args, selection = '' } = params

  // Tokenize args using shell-like splitting (respects single/double quotes)
  const positional = tokenizeArgs(args)

  // Apply substitutions in a single pass using a regex with a replacer.
  // Negative lookbehind `(?<!\w)` prevents matching inside identifiers
  // (e.g., `foo$1` won't match). We can't use `\b` because `@` is a
  // non-word character, so `$@` followed by a non-word char (e.g. `"`)
  // would not be a word boundary and would not match.
  //
  // Substitution semantics (FID-2026-0620-005, Q7):
  //   $1, $2, ... $N   — positional, tokenized by shell-like splitting
  //   $ARG             — entire raw args string (after the command)
  //   $@               — alias for $ARG (entire raw args string)
  //   $SELECTION       — the user's current selection (or empty)
  return body.replace(
    /(?<!\w)\$(?:(\d+)|ARG|@|SELECTION)/g,
    (match, numStr: string | undefined) => {
      if (match === '$@') return args
      if (match === '$ARG') return args
      if (match === '$SELECTION') return selection
      if (numStr !== undefined) {
        const idx = Number.parseInt(numStr, 10) - 1
        return positional[idx] ?? ''
      }
      return match
    },
  )
}

/**
 * Tokenize a string into positional arguments using shell-like rules:
 * - Whitespace separates tokens
 * - Single quotes preserve all characters verbatim (no escape sequences)
 * - Double quotes preserve all characters except `$` which is NOT expanded
 * - Backslash escapes the next character outside quotes
 *
 * This is intentionally NOT full POSIX shell parsing — it covers the
 * 99% case for slash command invocations.
 */
function tokenizeArgs(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false
  let hasCurrent = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (!inSingle && !inDouble && /\s/.test(ch)) {
      if (hasCurrent) {
        tokens.push(current)
        current = ''
        hasCurrent = false
      }
      continue
    }

    if (!inDouble && ch === "'") {
      inSingle = !inSingle
      hasCurrent = true
      continue
    }

    if (!inSingle && ch === '"') {
      inDouble = !inDouble
      hasCurrent = true
      continue
    }

    if (!inSingle && ch === '\\' && i + 1 < input.length) {
      current += input[i + 1]
      hasCurrent = true
      i++
      continue
    }

    current += ch
    hasCurrent = true
  }

  if (hasCurrent) {
    tokens.push(current)
  }

  return tokens
}

/**
 * Extract the rendered prompt for a custom command (FID-2026-0620-005).
 * Convenience wrapper that combines the command's body + substitution.
 */
export function renderCustomCommand(
  command: CustomCommand,
  args: string,
  selection?: string,
): string {
  return substituteCustomCommandTemplate({ body: command.body, args, selection })
}
