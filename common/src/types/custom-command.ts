import { z } from 'zod/v4'

import { CUSTOM_COMMANDS_EXTENSION } from '../constants/commands'

/**
 * Custom command frontmatter schema (FID-2026-0620-005).
 *
 * Strict Zod validation per the user's answer to Q5 — invalid frontmatter
 * surfaces as an error to the user (no silent corruption).
 */
export const CustomCommandFrontmatterSchema = z.object({
  /** Short description shown in the slash menu */
  description: z.string().min(1).max(200),
  /** Additional aliases for the command (without leading slash) */
  aliases: z.array(z.string().min(1).max(64)).optional(),
  /**
   * Hint shown in the input placeholder when the user types `/<name> `
   * (e.g. `"<ticket-id>"` for a `/pr` command).
   */
  argumentHint: z.string().max(64).optional(),
  /** Override the agent for this command (e.g. "reviewer") */
  agent: z.string().min(1).max(64).optional(),
  /** Override the model for this command (e.g. "anthropic/claude-sonnet-4.6") */
  model: z.string().min(1).max(128).optional(),
})

export type CustomCommandFrontmatter = z.infer<
  typeof CustomCommandFrontmatterSchema
>

/**
 * Full custom command definition.
 */
export interface CustomCommand {
  /** Command name (derived from filename without extension) */
  name: string
  /** Resolved file path */
  filePath: string
  /** Frontmatter (description, aliases, etc.) */
  frontmatter: CustomCommandFrontmatter
  /** Body content (the prompt template with $1, $2, $ARG, $@ placeholders) */
  body: string
}

/**
 * Collection of custom commands keyed by command name.
 */
export type CustomCommandsMap = Record<string, CustomCommand>

/**
 * Type guard: does this filename end in the allowed extension?
 */
export function isCustomCommandFile(filename: string): boolean {
  return filename.endsWith(CUSTOM_COMMANDS_EXTENSION)
}
