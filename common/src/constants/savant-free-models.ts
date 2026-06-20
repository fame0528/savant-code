import {
  addDaysToYmd,
  getUtcForZonedTime,
  getZonedParts,
  type ZonedDateParts,
} from '../util/zoned-time'
import { mimoModels, minimaxModels, moonshotModels } from './model-config'

/**
 * Models a savant-free user can pick between in the waiting-room model selector.
 *
 * Each model has its own queue (server keys queue position by `model`), so the
 * list here is effectively the set of separate waiting lines. Order is the
 * order shown in the UI.
 */
export interface Savant-FreeModelOption {
  /** Stable ID used in the wire protocol and DB. Matches the model id passed
   *  to the chat-completions endpoint. */
  id: string
  /** Short label for the selector UI. */
  displayName: string
  /** One-line description shown next to the label. */
  tagline: string
  /** Availability policy for the selector and server-side admission. */
  availability: 'always' | 'deployment_hours'
  /** Optional caveat shown in the picker (e.g. data-collection warning).
   *  Rendered in the warning/secondary color so users spot it before
   *  picking the model. */
  warning?: string
  /** Premium models carry a per-day usage limit
   *  (SAVANT_FREE_PREMIUM_SESSION_LIMIT). Surfaced in the UI as a "Premium"
   *  badge with the limit. Derived from SAVANT_FREE_PREMIUM_MODEL_IDS so the two
   *  never drift. */
  premium: boolean
  /** Whether the model accepts image input. Drives whether uploaded images
   *  are forwarded as real multimodal content vs. dropped/inlined as text. */
  multimodal: boolean
}

/** Server-facing fallback copy for APIs and provider errors that can't know
 *  the caller's local timezone. The CLI should render
 *  `getSavant-FreeDeploymentAvailabilityLabel()` instead. */
export const SAVANT_FREE_DEPLOYMENT_HOURS_LABEL = '9am ET-5pm PT every day'
export const SAVANT_FREE_GEMINI_PRO_MODEL_ID = 'google/gemini-3.1-pro-preview'
export const SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID = 'deepseek/deepseek-v4-pro'
export const SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID = 'deepseek/deepseek-v4-flash'
/** DeepSeek V4 Flash served by Fireworks instead of DeepSeek's direct API.
 *  Used only by savant-free.com/chat, where Fireworks' faster inference is worth
 *  a slightly less capable serving stack. Not in SUPPORTED_SAVANT_FREE_MODELS or
 *  the free-mode allowlists â€” the CLI and web builder keep DeepSeek direct. */
export const SAVANT_FREE_DEEPSEEK_V4_FLASH_FIREWORKS_MODEL_ID =
  'fireworks/deepseek-v4-flash'
export const SAVANT_FREE_KIMI_MODEL_ID = moonshotModels.kimiK26
/** Legacy: removed from the pickers on 2026-06-09 in favor of MiniMax M3, but
 *  still server-supported so old clients keep working. Drop from
 *  SUPPORTED_SAVANT_FREE_MODELS after ~2026-06-16. */
export const SAVANT_FREE_MINIMAX_MODEL_ID = 'minimax/minimax-m2.7'
/** Routes to MiniMax's official API (distinct from the m2.7 id). */
export const SAVANT_FREE_MINIMAX_M3_MODEL_ID = minimaxModels.minimaxM3
export const SAVANT_FREE_MIMO_V25_MODEL_ID = mimoModels.mimoV25
export const SAVANT_FREE_MIMO_V25_PRO_MODEL_ID = mimoModels.mimoV25Pro
/** UI-only rollout switch. Backend support and free-mode allowlists remain
 *  wired even when these models are hidden from the Savant-Free picker. */
export const SAVANT_FREE_ENABLE_MIMO_MODELS_IN_UI = true
/** UI-only rollout switch for the streak indicator in the waiting room. */
export const SAVANT_FREE_ENABLE_STREAK_IN_UI = true
/** Local/debug switch: force the localhost free-mode country bypass into
 *  limited access so the limited Savant-Free UX can be exercised without an env
 *  var. */
export const SAVANT_FREE_FORCE_LIMITED_MODE = false
export const SAVANT_FREE_PREMIUM_SESSION_LIMIT = 5
export const SAVANT_FREE_LIMITED_SESSION_LIMIT = 5
export const SAVANT_FREE_PREMIUM_SESSION_RESET_TIMEZONE = 'America/Los_Angeles'
export const SAVANT_FREE_PREMIUM_SESSION_PERIOD = 'pacific_day'
export const SAVANT_FREE_LIMITED_SESSION_RESET_TIMEZONE =
  SAVANT_FREE_PREMIUM_SESSION_RESET_TIMEZONE
export const SAVANT_FREE_LIMITED_SESSION_PERIOD = SAVANT_FREE_PREMIUM_SESSION_PERIOD
/** Deprecated wire compatibility field. Session usage now resets at midnight
 *  Pacific time rather than using a rolling hourly window. */
export const SAVANT_FREE_PREMIUM_SESSION_WINDOW_HOURS = 24
export const SAVANT_FREE_LIMITED_SESSION_WINDOW_HOURS =
  SAVANT_FREE_PREMIUM_SESSION_WINDOW_HOURS
const SAVANT_FREE_EASTERN_TIMEZONE = 'America/New_York'
const SAVANT_FREE_PACIFIC_TIMEZONE = 'America/Los_Angeles'

interface LocalTimeFormatOptions {
  locale?: string
  timeZone?: string
}

/** Full-access savant-free models that benefit from spawning the gemini-thinker
 *  subagent for deeper reasoning. Covers every full-access picker model except
 *  the two limited-tier ones (DeepSeek V4 Flash, MiMo 2.5); the legacy
 *  "Fastest" MiniMax M2.7 also skips it because the extra round-trip would
 *  defeat that tier. Used by the CLI to toggle the gemini-thinker spawnable +
 *  prompts based on the user's pick, and by the server to admit gemini-thinker
 *  child requests against a parent session bound to one of these models. */
export const SAVANT_FREE_GEMINI_THINKER_PARENT_MODELS = new Set<string>([
  SAVANT_FREE_KIMI_MODEL_ID,
  SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
  SAVANT_FREE_MINIMAX_M3_MODEL_ID,
])

export function canSavant-FreeModelSpawnGeminiThinker(modelId: string): boolean {
  return SAVANT_FREE_GEMINI_THINKER_PARENT_MODELS.has(modelId)
}

/** Single source of truth for "this model collects data for training". A model
 *  that carries this exact `warning` is both shown the caveat in the picker AND
 *  has its chat-completion traces stored in free mode (see
 *  SAVANT_FREE_TRACED_MODEL_IDS, which is derived from it) â€” the two can't drift. */
export const SAVANT_FREE_DATA_COLLECTION_WARNING = 'Collects data for training'

const DEEPSEEK_V4_PRO_MODEL = {
  id: SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  displayName: 'DeepSeek V4 Pro',
  tagline: 'Smartest',
  availability: 'always',
  warning: SAVANT_FREE_DATA_COLLECTION_WARNING,
  premium: true,
  multimodal: false,
} as const satisfies Savant-FreeModelOption

const MIMO_V25_PRO_MODEL = {
  id: SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
  displayName: 'MiMo 2.5 Pro',
  tagline: 'Smartest & Slow',
  availability: 'always',
  premium: true,
  multimodal: true,
} as const satisfies Savant-FreeModelOption

const KIMI_MODEL = {
  id: SAVANT_FREE_KIMI_MODEL_ID,
  displayName: 'Kimi K2.6',
  tagline: 'Balanced',
  availability: 'always',
  premium: true,
  multimodal: true,
} as const satisfies Savant-FreeModelOption

const MIMO_V25_MODEL = {
  id: SAVANT_FREE_MIMO_V25_MODEL_ID,
  displayName: 'MiMo 2.5',
  tagline: 'Multimodal',
  availability: 'always',
  premium: false,
  multimodal: true,
} as const satisfies Savant-FreeModelOption

const DEEPSEEK_V4_FLASH_MODEL = {
  id: SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  displayName: 'DeepSeek V4 Flash',
  tagline: 'Smart & Fast',
  availability: 'always',
  warning: SAVANT_FREE_DATA_COLLECTION_WARNING,
  premium: false,
  multimodal: false,
} as const satisfies Savant-FreeModelOption

/** Legacy (not in SAVANT_FREE_MODELS): see SAVANT_FREE_MINIMAX_MODEL_ID. */
const MINIMAX_MODEL = {
  id: SAVANT_FREE_MINIMAX_MODEL_ID,
  displayName: 'MiniMax M2.7',
  tagline: 'Fastest',
  availability: 'always',
  premium: false,
  multimodal: false,
} as const satisfies Savant-FreeModelOption

const MINIMAX_M3_MODEL = {
  id: SAVANT_FREE_MINIMAX_M3_MODEL_ID,
  displayName: 'MiniMax M3',
  tagline: 'Smartest & Fastest',
  availability: 'always',
  // No data-collection warning: M3 is served by Fireworks (no provider-side
  // training). Omitting the warning also keeps it out of SAVANT_FREE_TRACED_MODEL_IDS,
  // so we don't store its traces either.
  premium: false,
  multimodal: true,
} as const satisfies Savant-FreeModelOption

export const SUPPORTED_SAVANT_FREE_MODELS = [
  DEEPSEEK_V4_PRO_MODEL,
  MIMO_V25_PRO_MODEL,
  KIMI_MODEL,
  MINIMAX_M3_MODEL,
  DEEPSEEK_V4_FLASH_MODEL,
  MIMO_V25_MODEL,
  MINIMAX_MODEL,
] as const satisfies readonly Savant-FreeModelOption[]

export const SAVANT_FREE_MODELS = [
  DEEPSEEK_V4_PRO_MODEL,
  ...(SAVANT_FREE_ENABLE_MIMO_MODELS_IN_UI ? [MIMO_V25_PRO_MODEL] : []),
  KIMI_MODEL,
  DEEPSEEK_V4_FLASH_MODEL,
  ...(SAVANT_FREE_ENABLE_MIMO_MODELS_IN_UI ? [MIMO_V25_MODEL] : []),
  MINIMAX_M3_MODEL,
] as const satisfies readonly Savant-FreeModelOption[]

export const SAVANT_FREE_PREMIUM_MODEL_IDS = [
  SAVANT_FREE_DEEPSEEK_V4_PRO_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
  SAVANT_FREE_KIMI_MODEL_ID,
] as const

/** Models that accept image input. Used to decide whether uploaded images are
 *  forwarded to the model as real multimodal content. */
export const SAVANT_FREE_MULTIMODAL_MODEL_IDS = [
  SAVANT_FREE_MIMO_V25_MODEL_ID,
  SAVANT_FREE_MIMO_V25_PRO_MODEL_ID,
  SAVANT_FREE_MINIMAX_M3_MODEL_ID,
  SAVANT_FREE_KIMI_MODEL_ID,
] as const

/** Free-mode models whose chat-completion traces we store in our own dataset
 *  (chat_completion_traces). Derived from the picker's data-collection warning
 *  so the disclosure and the storage are one fact: a model is traced in free
 *  mode iff it shows the "Collects data for training" caveat. Every other free
 *  model (incl. MiniMax M3 on Fireworks) is NOT stored; paid, non-free-mode
 *  requests are unaffected and traced as usual. */
export const SAVANT_FREE_TRACED_MODEL_IDS = SUPPORTED_SAVANT_FREE_MODELS.filter(
  (model: Savant-FreeModelOption) =>
    model.warning === SAVANT_FREE_DATA_COLLECTION_WARNING,
).map((model) => model.id)

export type Savant-FreeModelId = (typeof SAVANT_FREE_MODELS)[number]['id']
export type SupportedSavant-FreeModelId =
  (typeof SUPPORTED_SAVANT_FREE_MODELS)[number]['id']
export type Savant-FreePremiumModelId = (typeof SAVANT_FREE_PREMIUM_MODEL_IDS)[number]

/** What new savant-free users see selected in the picker. MiniMax M3 is the
 *  strongest unlimited model (smartest & multimodal), so new users get good
 *  quality without burning the 5/day premium quota on routine messages.
 *  Callers that need a guaranteed-available id for resolution /
 *  auto-fallbacks should use FALLBACK_SAVANT_FREE_MODEL_ID instead. */
export const DEFAULT_SAVANT_FREE_MODEL_ID: Savant-FreeModelId =
  SAVANT_FREE_MINIMAX_M3_MODEL_ID

/** Always-available fallback used when the requested model can't be served
 *  right now (unknown id, deployment hours closed, etc.). Kept distinct from
 *  DEFAULT_SAVANT_FREE_MODEL_ID so a new user's "preferred default" can be the
 *  smartest model without auto-flipping anyone to a closed serverless model. */
export const FALLBACK_SAVANT_FREE_MODEL_ID: Savant-FreeModelId =
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID

export const LIMITED_SAVANT_FREE_MODEL_ID: Savant-FreeModelId =
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID
export const LIMITED_SAVANT_FREE_MODEL_IDS = [
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  SAVANT_FREE_MIMO_V25_MODEL_ID,
] as const
export const LIMITED_SAVANT_FREE_MODELS = LIMITED_SAVANT_FREE_MODEL_IDS.map(
  (modelId) => SUPPORTED_SAVANT_FREE_MODELS.find((model) => model.id === modelId)!,
)

export type Savant-FreeAccessTier = 'full' | 'limited'

/** Access tier carried in the Savant-Free Web Convex JWT. Extends the CLI tier
 *  with 'blocked' (Tor / corroborated anonymous network): the app still
 *  loads, but every agent send is rejected server-side. */
export type Savant-FreeWebAccessTier = Savant-FreeAccessTier | 'blocked'

/** Savant-Free Web limited-tier session pool. Deliberately separate from the
 *  CLI's Postgres-backed session pool â€” enforced entirely in Convex. */
export const SAVANT_FREE_WEB_LIMITED_SESSION_LIMIT = 5
export const SAVANT_FREE_WEB_LIMITED_SESSION_LENGTH_MS = 60 * 60 * 1000

/** Models exempt from Savant-Free Web geo limits: geo-limited users can run
 *  these without consuming limited sessions. Matches the shared limited
 *  model set (DeepSeek V4 Flash, MiMo 2.5); every other model stays
 *  geo-gated. Web-only â€” the CLI's limited pool is unaffected. */
export const SAVANT_FREE_WEB_GEO_EXEMPT_MODEL_IDS = [
  SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID,
  SAVANT_FREE_MIMO_V25_MODEL_ID,
] as const

export function isSavant-FreeWebGeoExemptModelId(
  id: string | null | undefined,
): boolean {
  if (!id) return false
  return SAVANT_FREE_WEB_GEO_EXEMPT_MODEL_IDS.some((modelId) => modelId === id)
}

/** Models a limited-tier Savant-Free Web user may select: the geo-exempt models
 *  (unlimited) plus the shared limited set (session-gated). */
export const SAVANT_FREE_WEB_LIMITED_MODEL_IDS = [
  ...new Set<string>([
    ...SAVANT_FREE_WEB_GEO_EXEMPT_MODEL_IDS,
    ...LIMITED_SAVANT_FREE_MODEL_IDS,
  ]),
]

export function isSavant-FreeWebModelAllowedForLimitedTier(
  id: string | null | undefined,
): boolean {
  if (!id) return false
  return SAVANT_FREE_WEB_LIMITED_MODEL_IDS.some((modelId) => modelId === id)
}

/** Coerce a limited-tier Savant-Free Web selection (premium ids, stale
 *  localStorage values) to an allowed model. Falls back to the limited
 *  default (DeepSeek V4 Flash), which is geo-exempt, so limited users land
 *  on unlimited usage. */
export function resolveSavant-FreeWebModelForLimitedTier(
  id: string | null | undefined,
): string {
  return isSavant-FreeWebModelAllowedForLimitedTier(id)
    ? (id as string)
    : LIMITED_SAVANT_FREE_MODEL_ID
}

export function getSavant-FreeModelsForAccessTier(
  accessTier: Savant-FreeAccessTier | null | undefined,
): readonly Savant-FreeModelOption[] {
  if (accessTier === 'limited') return LIMITED_SAVANT_FREE_MODELS
  return SAVANT_FREE_MODELS
}

/** The model the picker highlights as the "recommended" hero so a new user can
 *  start with one Enter press without scanning the full list. Full access â†’
 *  MiniMax M3 (the smart, unlimited, multimodal default); limited â†’ the
 *  always-available flash model. Both are unlimited, so the recommended pick
 *  never burns the daily premium quota. */
export function getRecommendedSavant-FreeModelId(
  accessTier: Savant-FreeAccessTier | null | undefined,
): SupportedSavant-FreeModelId {
  return accessTier === 'limited'
    ? LIMITED_SAVANT_FREE_MODEL_ID
    : DEFAULT_SAVANT_FREE_MODEL_ID
}

export function isSavant-FreeModelAllowedForAccessTier(
  model: string | null | undefined,
  accessTier: Savant-FreeAccessTier | null | undefined,
): boolean {
  if (!model) return false
  if (accessTier !== 'limited') return isSupportedSavant-FreeModelId(model)
  return LIMITED_SAVANT_FREE_MODEL_IDS.some((modelId) => modelId === model)
}

export function isSavant-FreeModelId(
  id: string | null | undefined,
): id is Savant-FreeModelId {
  if (!id) return false
  return SAVANT_FREE_MODELS.some((m) => m.id === id)
}

export function resolveSavant-FreeModel(
  id: string | null | undefined,
): Savant-FreeModelId {
  return isSavant-FreeModelId(id) ? id : FALLBACK_SAVANT_FREE_MODEL_ID
}

export function resolveSavant-FreeModelForAccessTier(
  id: string | null | undefined,
  accessTier: Savant-FreeAccessTier | null | undefined,
): SupportedSavant-FreeModelId {
  if (accessTier === 'limited') {
    return isSavant-FreeModelAllowedForAccessTier(id, accessTier)
      ? (id as SupportedSavant-FreeModelId)
      : LIMITED_SAVANT_FREE_MODEL_ID
  }
  const resolved = resolveSupportedSavant-FreeModel(id)
  return isSavant-FreeModelAllowedForAccessTier(resolved, accessTier)
    ? resolved
    : FALLBACK_SAVANT_FREE_MODEL_ID
}

export function isSupportedSavant-FreeModelId(
  id: string | null | undefined,
): id is SupportedSavant-FreeModelId {
  if (!id) return false
  return SUPPORTED_SAVANT_FREE_MODELS.some((m) => m.id === id)
}

export function isSavant-FreePremiumModelId(
  id: string | null | undefined,
): id is Savant-FreePremiumModelId {
  if (!id) return false
  return SAVANT_FREE_PREMIUM_MODEL_IDS.some((modelId) => modelId === id)
}

export function isSavant-FreeMultimodalModelId(
  id: string | null | undefined,
): boolean {
  if (!id) return false
  return SAVANT_FREE_MULTIMODAL_MODEL_IDS.some((modelId) => modelId === id)
}

/** Whether we store our own chat-completion traces for this free-mode model.
 *  See SAVANT_FREE_TRACED_MODEL_IDS. */
export function isSavant-FreeTracedModelId(
  id: string | null | undefined,
): boolean {
  if (!id) return false
  return SAVANT_FREE_TRACED_MODEL_IDS.some((modelId) => modelId === id)
}

export function resolveSupportedSavant-FreeModel(
  id: string | null | undefined,
): SupportedSavant-FreeModelId {
  return isSupportedSavant-FreeModelId(id) ? id : FALLBACK_SAVANT_FREE_MODEL_ID
}

export function getSavant-FreeModel(id: string): Savant-FreeModelOption {
  return (
    SUPPORTED_SAVANT_FREE_MODELS.find((m) => m.id === id) ??
    SAVANT_FREE_MODELS.find((m) => m.id === FALLBACK_SAVANT_FREE_MODEL_ID)!
  )
}

function getNextSavant-FreeDeploymentStart(now: Date): Date {
  const easternNow = getZonedParts(now, SAVANT_FREE_EASTERN_TIMEZONE)
  const isBeforeTodayOpen = easternNow.hour < 9

  const offset = isBeforeTodayOpen ? 0 : 1

  return getUtcForZonedTime(
    addDaysToYmd(easternNow.year, easternNow.month, easternNow.day, offset),
    SAVANT_FREE_EASTERN_TIMEZONE,
    9,
    0,
  )
}

function getCurrentSavant-FreeDeploymentEnd(now: Date): Date {
  const pacificNow = getZonedParts(now, SAVANT_FREE_PACIFIC_TIMEZONE)
  return getUtcForZonedTime(pacificNow, SAVANT_FREE_PACIFIC_TIMEZONE, 17, 0)
}

function isSameLocalDay(left: Date, right: Date, timeZone?: string): boolean {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(left) === formatter.format(right)
}

function formatLocalTime(
  date: Date,
  referenceNow: Date,
  options: LocalTimeFormatOptions = {},
): string {
  const shouldShowWeekday = !isSameLocalDay(
    date,
    referenceNow,
    options.timeZone,
  )
  return new Intl.DateTimeFormat(options.locale, {
    timeZone: options.timeZone,
    weekday: shouldShowWeekday ? 'short' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function getSavant-FreeDeploymentAvailabilityLabel(
  now: Date = new Date(),
  options: LocalTimeFormatOptions = {},
): string {
  if (isSavant-FreeDeploymentHours(now)) {
    const closesAt = getCurrentSavant-FreeDeploymentEnd(now)
    return `until ${formatLocalTime(closesAt, now, options)}`
  }

  const opensAt = getNextSavant-FreeDeploymentStart(now)
  return `opens ${formatLocalTime(opensAt, now, options)}`
}

export function isSavant-FreeDeploymentHours(now: Date = new Date()): boolean {
  const eastern = getZonedParts(now, SAVANT_FREE_EASTERN_TIMEZONE)
  const pacific = getZonedParts(now, SAVANT_FREE_PACIFIC_TIMEZONE)
  return (
    eastern.hour * 60 + eastern.minute >= 9 * 60 &&
    pacific.hour * 60 + pacific.minute < 17 * 60
  )
}

export function isSavant-FreeModelAvailable(
  id: string,
  now: Date = new Date(),
): boolean {
  const model = SUPPORTED_SAVANT_FREE_MODELS.find((m) => m.id === id)
  if (!model) return false
  return model.availability === 'always' || isSavant-FreeDeploymentHours(now)
}

export function resolveAvailableSavant-FreeModel(
  id: string | null | undefined,
  now: Date = new Date(),
): Savant-FreeModelId {
  const resolved = resolveSavant-FreeModel(id)
  return isSavant-FreeModelAvailable(resolved, now)
    ? resolved
    : FALLBACK_SAVANT_FREE_MODEL_ID
}
