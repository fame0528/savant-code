import type {
  CustomCommand,
  CustomCommandsMap,
} from '@savant-code/common/types/custom-command'

import {
  loadCustomCommands as loadCustomCommandsImpl,
  __resetCustomCommandCacheForTests,
} from './load-custom-commands'

// ============================================================================
// Custom command cache (loaded at CLI startup, FID-2026-0620-005)
// ============================================================================

let customCommandsCache: CustomCommandsMap = {}

/**
 * Initialize the custom command registry by loading .savant/commands/*.md
 * files. Must be called at CLI startup.
 */
export async function initializeCustomCommandRegistry(): Promise<void> {
  try {
    customCommandsCache = await loadCustomCommandsImpl({ verbose: false })
  } catch (error) {
    // The loader logs individual failures; surface a generic error here
    // eslint-disable-next-line no-console
    console.error('Failed to load custom commands:', error)
    customCommandsCache = {}
  }
}

// ============================================================================
// Custom command access
// ============================================================================

/**
 * Get all loaded custom commands.
 */
export function getLoadedCustomCommands(): CustomCommandsMap {
  return customCommandsCache
}

/**
 * Get a custom command by name.
 */
export function getCustomCommandByName(name: string): CustomCommand | undefined {
  return customCommandsCache[name]
}

/**
 * Get the number of loaded custom commands.
 */
export function getCustomCommandCount(): number {
  return Object.keys(customCommandsCache).length
}

// ============================================================================
// Testing utilities
// ============================================================================

/**
 * Clear cached custom commands and reset the first-load warning tracker.
 * Intended for test scenarios.
 */
export function __resetCustomCommandRegistryForTests(): void {
  customCommandsCache = {}
  __resetCustomCommandCacheForTests()
}

/**
 * Manually inject a custom command into the cache. Used by tests to
 * simulate custom commands without touching the filesystem.
 */
export function __setCustomCommandForTests(cmd: CustomCommand): void {
  customCommandsCache[cmd.name] = cmd
}
