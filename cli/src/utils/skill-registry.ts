import {
  activateSkill as sdkActivateSkill,
  loadSkillsMetadata as sdkLoadSkillsMetadata,
} from '@savant-code/sdk'

import { getProjectRoot } from '../project-files'
import { logger } from './logger'

import type {
  SkillDefinition,
  SkillMetadata,
  SkillsMap,
  SkillsMetadataMap,
} from '@savant-code/common/types/skill'

// ============================================================================
// Skills cache (metadata-only at startup — FID-2026-0620-004 progressive load)
// ============================================================================

let skillsCache: SkillsMap = {}
let skillsMetadataCache: SkillsMetadataMap = {}

/**
 * Initialize the skill registry by loading skills via the SDK.
 * This must be called at CLI startup.
 *
 * FID-2026-0620-004 — progressive skill loading.
 * Only frontmatter (name + description + license + autoActivate) is loaded
 * eagerly. Full content is loaded on demand via `activateSkillByName`.
 *
 * Skills are loaded from:
 * - ~/.agents/skills/ (global)
 * - {projectRoot}/.agents/skills/ (project, overrides global)
 */
export async function initializeSkillRegistry(): Promise<void> {
  const cwd = getProjectRoot() || process.cwd()

  try {
    // Tier 1 — discover metadata only. Project overrides global.
    skillsMetadataCache = await sdkLoadSkillsMetadata({ cwd, verbose: false })

    // Backwards-compat: build SkillsMap (with content populated only for
    // autoActivate: true skills). Consumers that need full content for a
    // specific skill should call `activateSkillByName(name)` on demand.
    skillsCache = {}
    for (const [name, meta] of Object.entries(skillsMetadataCache)) {
      if (meta.autoActivate) {
        const full = await sdkActivateSkill(name, { cwd, verbose: false })
        skillsCache[name] =
          full ??
          ({
            name: meta.name,
            description: meta.description,
            license: meta.license,
            metadata: meta.metadata,
            autoActivate: meta.autoActivate,
            content: '',
            filePath: meta.filePath,
          } as SkillDefinition)
      } else {
        skillsCache[name] = {
          name: meta.name,
          description: meta.description,
          license: meta.license,
          metadata: meta.metadata,
          autoActivate: meta.autoActivate,
          content: '',
          filePath: meta.filePath,
        }
      }
    }
  } catch (error) {
    logger.warn({ error }, 'Failed to load skills')
    skillsCache = {}
    skillsMetadataCache = {}
  }
}

// ============================================================================
// Skills access
// ============================================================================

/**
 * Get all loaded skills (metadata-only by default; `content` populated only
 * for `autoActivate: true` skills).
 *
 * FID-2026-0620-004 — most consumers should use `getLoadedSkillsMetadata`
 * to be explicit that they only need name + description.
 */
export function getLoadedSkills(): SkillsMap {
  return skillsCache
}

/**
 * Get the metadata-only view of all loaded skills. Preferred over
 * `getLoadedSkills()` for UI / display purposes.
 */
export function getLoadedSkillsMetadata(): SkillsMetadataMap {
  return skillsMetadataCache
}

/**
 * Get a skill by name (returns metadata + content if loaded).
 * Note: if the skill was NOT auto-activated, `content` will be `''`.
 * Use `activateSkillByName(name)` to ensure full content is available.
 */
export function getSkillByName(name: string): SkillDefinition | undefined {
  return skillsCache[name]
}

/**
 * Get the metadata for a skill (never reads the body).
 */
export function getSkillMetadataByName(name: string): SkillMetadata | undefined {
  return skillsMetadataCache[name]
}

/**
 * Activate a skill on demand — reads the full SKILL.md body and returns
 * the populated `SkillDefinition`. Caches the result in the runtime cache.
 *
 * FID-2026-0620-004 — Tier 2 activation.
 *
 * @returns The full SkillDefinition, or `null` if the skill is not found.
 */
export async function activateSkillByName(
  name: string,
): Promise<SkillDefinition | null> {
  const cwd = getProjectRoot() || process.cwd()
  const full = await sdkActivateSkill(name, { cwd, verbose: false })
  if (full) {
    skillsCache[name] = full
  }
  return full
}

/**
 * Get the number of loaded skills.
 */
export function getSkillCount(): number {
  return Object.keys(skillsCache).length
}

// ============================================================================
// UI/Display utilities
// ============================================================================

/**
 * Get a message describing loaded skills for display.
 */
export function getLoadedSkillsMessage(): string | null {
  const skills = Object.values(skillsCache)

  if (skills.length === 0) {
    return null
  }

  const header = `Loaded ${skills.length} skill${skills.length === 1 ? '' : 's'}`
  const skillList = skills
    .map(
      (skill) =>
        `  - ${skill.name}${skill.autoActivate ? ' [auto-activate]' : ''}: ${skill.description.slice(0, 60)}${skill.description.length > 60 ? '...' : ''}`,
    )
    .join('\n')

  return `${header}\n${skillList}`
}

// ============================================================================
// Testing utilities
// ============================================================================

/**
 * Clear cached skills. Intended for test scenarios.
 */
export function __resetSkillRegistryForTests(): void {
  skillsCache = {}
  skillsMetadataCache = {}
}
