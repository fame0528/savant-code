import { z } from 'zod/v4'

import {
  SKILL_NAME_MAX_LENGTH,
  SKILL_NAME_REGEX,
  SKILL_DESCRIPTION_MAX_LENGTH,
} from '../constants/skills'

/**
 * Zod schema for skill frontmatter metadata.
 */
export const SkillMetadataSchema = z.record(z.string(), z.string())

/**
 * Zod schema for skill frontmatter (parsed from YAML).
 *
 * `autoActivate` (FID-2026-0620-004 — progressive skill loading): when `true`,
 * the skill's full content is loaded eagerly at session start (same as the
 * legacy "load everything" behavior). When `false` (default), only the
 * frontmatter (name + description) is loaded eagerly; the full content is
 * loaded on demand by the `activate_skill` tool or the `/skill:<name>` command.
 */
export const SkillFrontmatterSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(SKILL_NAME_MAX_LENGTH)
    .regex(
      SKILL_NAME_REGEX,
      'Name must be lowercase alphanumeric with single hyphen separators',
    ),
  description: z.string().min(1).max(SKILL_DESCRIPTION_MAX_LENGTH),
  license: z.string().optional(),
  metadata: SkillMetadataSchema.optional(),
  autoActivate: z.boolean().optional(),
})

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>

/**
 * Skill definition with metadata only (FID-2026-0620-004 — progressive loading).
 * This is what `loadSkillsMetadata` returns. The `content` field is empty until
 * the skill is activated via `activateSkill` / `activate_skill` tool.
 */
export interface SkillMetadata {
  /** Skill name (must match directory name) */
  name: string
  /** Short description for agent discovery */
  description: string
  /** Optional license */
  license?: string
  /** Optional key-value metadata */
  metadata?: Record<string, string>
  /**
   * Whether this skill was marked `autoActivate: true` in its frontmatter.
   * Auto-activated skills have their content loaded eagerly at session start.
   */
  autoActivate?: boolean
  /** Source file path */
  filePath: string
}

/**
 * Collection of skills keyed by skill name (metadata-only view).
 */
export type SkillsMetadataMap = Record<string, SkillMetadata>

/**
 * Full skill definition including content.
 *
 * `content` is empty for skills that were discovered via `loadSkillsMetadata`
 * but not yet activated via `activateSkill`. Use `activateSkill(name)` to
 * populate it.
 */
export const SkillDefinitionSchema = z.object({
  /** Skill name (must match directory name) */
  name: z.string(),
  /** Short description for agent discovery */
  description: z.string(),
  /** Optional license */
  license: z.string().optional(),
  /** Optional key-value metadata */
  metadata: SkillMetadataSchema.optional(),
  /** Whether this skill auto-activates at session start */
  autoActivate: z.boolean().optional(),
  /** Full SKILL.md content (empty string if not yet activated) */
  content: z.string(),
  /** Source file path */
  filePath: z.string(),
})

export type SkillDefinition = z.infer<typeof SkillDefinitionSchema>

/**
 * Collection of skills keyed by skill name.
 */
export type SkillsMap = Record<string, SkillDefinition>
