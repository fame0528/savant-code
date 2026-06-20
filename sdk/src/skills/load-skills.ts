import fs from 'fs'
import os from 'os'
import path from 'path'

import {
  SKILLS_DIR_NAME,
  SKILL_FILE_NAME,
  isValidSkillName,
} from '@savant-code/common/constants/skills'
import {
  SkillFrontmatterSchema,
  type SkillDefinition,
  type SkillMetadata,
  type SkillsMap,
  type SkillsMetadataMap,
} from '@savant-code/common/types/skill'
import matter from 'gray-matter'

// Re-export from common for backward compatibility
export { formatAvailableSkillsXml } from '@savant-code/common/util/skills'

/**
 * Parses YAML frontmatter from a SKILL.md file using gray-matter.
 * Frontmatter is expected to be between --- markers at the start of the file.
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>
  body: string
} | null {
  try {
    const parsed = matter(content)
    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      return null
    }
    return {
      frontmatter: parsed.data as Record<string, unknown>,
      body: parsed.content,
    }
  } catch {
    return null
  }
}

/**
 * Extracts the `file://` or `path:` metadata value from a SKILL.md body.
 * Used for optional referenced-file resolution (FID-2026-0620-004 step 3).
 */
function extractReferencedFiles(body: string): string[] {
  // Pattern: <!-- referenced: <path1>, <path2> -->
  const match = body.match(/<!--\s*referenced:\s*([^*]+?)\s*-->/)
  if (!match) return []
  return match[1]
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Loads a single skill's metadata (frontmatter only) from a SKILL.md file.
 * Returns null if the skill is invalid.
 *
 * FID-2026-0620-004 — progressive skill loading (tier 1: discovery).
 * This reads the entire file (we need the frontmatter) but does NOT
 * expose the body content to callers. The body is only read in full by
 * `activateSkill()`.
 */
function loadSkillMetadataFromFile(
  skillDir: string,
  skillFilePath: string,
  verbose: boolean,
): SkillMetadata | null {
  const dirName = path.basename(skillDir)

  // Read the file
  let content: string
  try {
    content = fs.readFileSync(skillFilePath, 'utf8')
  } catch {
    if (verbose) {
      console.error(`Failed to read skill file: ${skillFilePath}`)
    }
    return null
  }

  // Parse frontmatter
  const parsed = parseFrontmatter(content)
  if (!parsed) {
    if (verbose) {
      console.error(`Invalid frontmatter in skill file: ${skillFilePath}`)
    }
    return null
  }

  // Validate frontmatter
  const result = SkillFrontmatterSchema.safeParse(parsed.frontmatter)
  if (!result.success) {
    if (verbose) {
      console.error(
        `Invalid skill frontmatter in ${skillFilePath}: ${result.error.message}`,
      )
    }
    return null
  }

  const frontmatter = result.data

  // Verify name matches directory name
  if (frontmatter.name !== dirName) {
    if (verbose) {
      console.error(
        `Skill name '${frontmatter.name}' does not match directory name '${dirName}' in ${skillFilePath}`,
      )
    }
    return null
  }

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    license: frontmatter.license,
    metadata: frontmatter.metadata,
    autoActivate: frontmatter.autoActivate,
    filePath: skillFilePath,
  }
}

/**
 * Discovers skill metadata from a skills directory (tier 1: discovery).
 * Looks for <skillsDir>/<skill-name>/SKILL.md files and reads only the
 * frontmatter from each. Bodies are NOT loaded here.
 */
function discoverSkillsMetadataFromDirectory(
  skillsDir: string,
  verbose: boolean,
): SkillsMetadataMap {
  const skills: SkillsMetadataMap = {}

  let entries: string[]
  try {
    entries = fs.readdirSync(skillsDir)
  } catch {
    return skills
  }

  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry)

    // Skip non-directories and invalid skill names
    try {
      const stat = fs.statSync(skillDir)
      if (!stat.isDirectory()) continue
    } catch {
      continue
    }

    if (!isValidSkillName(entry)) {
      if (verbose) {
        console.warn(`Skipping invalid skill directory name: ${entry}`)
      }
      continue
    }

    const skillFilePath = path.join(skillDir, SKILL_FILE_NAME)

    // Check if SKILL.md exists
    try {
      fs.statSync(skillFilePath)
    } catch {
      continue
    }

    const skill = loadSkillMetadataFromFile(skillDir, skillFilePath, verbose)
    if (skill) {
      skills[skill.name] = skill
    }
  }

  return skills
}

/**
 * Gets the default skills directories to search.
 * Searches both .claude/skills and .agents/skills for Claude Code compatibility.
 *
 * Order (later overrides earlier):
 * - ~/.claude/skills/ (global Claude-compatible)
 * - ~/.agents/skills/ (global Savant-Code)
 * - {cwd}/.claude/skills/ (project Claude-compatible)
 * - {cwd}/.agents/skills/ (project Savant-Code)
 */
function getDefaultSkillsDirs(cwd: string): string[] {
  const home = os.homedir()
  return [
    // Global directories (Claude-compatible first, then Savant-Code)
    path.join(home, '.claude', SKILLS_DIR_NAME),
    path.join(home, '.agents', SKILLS_DIR_NAME),
    // Project directories (Claude-compatible first, then Savant-Code)
    path.join(cwd, '.claude', SKILLS_DIR_NAME),
    path.join(cwd, '.agents', SKILLS_DIR_NAME),
  ]
}

export type LoadSkillsOptions = {
  /** Working directory for project skills. Defaults to process.cwd() */
  cwd?: string
  /** Optional specific skills directory path */
  skillsPath?: string
  /** Whether to log errors during loading */
  verbose?: boolean
}

export type ActivateSkillOptions = {
  /** Working directory for project skills. Defaults to process.cwd() */
  cwd?: string
  /** Optional specific skills directory path (searched instead of default roots) */
  skillsPath?: string
  /** Whether to log errors during loading */
  verbose?: boolean
  /**
   * If `true`, also load any files referenced via the
   * `<!-- referenced: path1, path2 -->` directive in the skill body.
   * Their contents are appended to the returned `content` field.
   * Defaults to `false` (v1 — most skills don't use this).
   */
  loadReferencedFiles?: boolean
}

/**
 * TIER 1 — Discovery: load only the frontmatter of every SKILL.md in the
 * default search roots. The full body content is NOT loaded.
 *
 * FID-2026-0620-004 — progressive skill loading.
 *
 * Use this at session start. The returned skills can be advertised in the
 * system prompt via `formatAvailableSkillsXml` (name + description only).
 * When a specific skill is needed, call `activateSkill(name)` to load its
 * full content.
 *
 * @returns Map of skill name → metadata (no body content)
 */
export async function loadSkillsMetadata(
  options: LoadSkillsOptions = {},
): Promise<SkillsMetadataMap> {
  const { cwd = process.cwd(), skillsPath, verbose = false } = options

  const skills: SkillsMetadataMap = {}

  const skillsDirs = skillsPath ? [skillsPath] : getDefaultSkillsDirs(cwd)

  for (const skillsDir of skillsDirs) {
    const dirSkills = discoverSkillsMetadataFromDirectory(skillsDir, verbose)
    // Later directories override earlier ones (project overrides global)
    Object.assign(skills, dirSkills)
  }

  return skills
}

/**
 * TIER 2 — Activation: load the full body of a single skill on demand.
 *
 * FID-2026-0620-004 — progressive skill loading.
 *
 * Use this when the agent invokes the `activate_skill` tool or the user
 * types `/skill:<name>`. The skill is located by name across the same
 * default search roots as `loadSkillsMetadata`.
 *
 * @returns The full SkillDefinition with `content` populated, or `null`
 *   if the skill cannot be found / parsed.
 */
export async function activateSkill(
  skillName: string,
  options: ActivateSkillOptions = {},
): Promise<SkillDefinition | null> {
  const { cwd = process.cwd(), skillsPath, verbose = false, loadReferencedFiles = false } = options

  const skillsDirs = skillsPath ? [skillsPath] : getDefaultSkillsDirs(cwd)

  for (const skillsDir of skillsDirs) {
    const candidates = discoverSkillsMetadataFromDirectory(skillsDir, verbose)
    const candidate = candidates[skillName]
    if (!candidate) continue

    // Read the full file again (cheap, single read; could be cached)
    let content: string
    try {
      content = fs.readFileSync(candidate.filePath, 'utf8')
    } catch (err) {
      if (verbose) {
        console.error(
          `Failed to read skill file during activation: ${candidate.filePath}`,
        )
      }
      return null
    }

    let fullContent = content

    // TIER 3 — Reference resolution (optional, opt-in via flag)
    if (loadReferencedFiles) {
      const body = content.split('---').slice(2).join('---').trim()
      const referenced = extractReferencedFiles(body)
      if (referenced.length > 0) {
        const skillDir = path.dirname(candidate.filePath)
        const resolved = referenced
          .map((rel) => {
            try {
              return fs.readFileSync(path.join(skillDir, rel), 'utf8')
            } catch {
              if (verbose) {
                console.warn(
                  `Failed to read referenced file '${rel}' for skill '${skillName}'`,
                )
              }
              return null
            }
          })
          .filter((c): c is string => c !== null)
        if (resolved.length > 0) {
          fullContent +=
            '\n\n<!-- referenced files -->\n' + resolved.join('\n\n---\n\n')
        }
      }
    }

    return {
      name: candidate.name,
      description: candidate.description,
      license: candidate.license,
      metadata: candidate.metadata,
      autoActivate: candidate.autoActivate,
      content: fullContent,
      filePath: candidate.filePath,
    }
  }

  if (verbose) {
    console.error(`Skill not found in any search root: ${skillName}`)
  }
  return null
}

/**
 * TIER 1+2 — Eager loader (legacy / backwards-compatible).
 *
 * FID-2026-0620-004 — progressive skill loading.
 *
 * Discovers all skills AND eagerly populates `content` for those with
 * `autoActivate: true` in their frontmatter. Skills without `autoActivate`
 * are returned with empty `content` (use `activateSkill(name)` to load
 * them on demand).
 *
 * Most consumers should prefer `loadSkillsMetadata` + `activateSkill` for
 * the full progressive experience. This function is kept for:
 *   - Backwards compatibility with code that expects populated `content`
 *   - Tools that need the full body in one shot (e.g. for snapshot tests)
 *
 * @returns Map of skill name → SkillDefinition (content populated only for
 *   skills with `autoActivate: true`)
 */
export async function loadSkills(
  options: LoadSkillsOptions = {},
): Promise<SkillsMap> {
  const metadata = await loadSkillsMetadata(options)

  const skills: SkillsMap = {}
  for (const [name, meta] of Object.entries(metadata)) {
    if (meta.autoActivate) {
      const full = await activateSkill(name, options)
      skills[name] =
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
      skills[name] = {
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

  return skills
}
