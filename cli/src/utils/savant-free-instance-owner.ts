import fs from 'fs'
import path from 'path'

import { getConfigDir } from './auth'
import { logger } from './logger'

interface Savant-FreeInstanceOwner {
  instanceId: string
  pid: number
}

const OWNER_FILE = 'savant-free-instance-owner.json'

const getOwnerPath = (): string => path.join(getConfigDir(), OWNER_FILE)

function readOwner(): Savant-FreeInstanceOwner | null {
  try {
    const raw = fs.readFileSync(getOwnerPath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<Savant-FreeInstanceOwner>
    if (
      typeof parsed.instanceId !== 'string' ||
      typeof parsed.pid !== 'number'
    ) {
      return null
    }
    return {
      instanceId: parsed.instanceId,
      pid: parsed.pid,
    }
  } catch {
    return null
  }
}

function isProcessRunning(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

export function recordSavant-FreeInstanceOwner(instanceId: string): void {
  try {
    fs.mkdirSync(getConfigDir(), { recursive: true })
    fs.writeFileSync(
      getOwnerPath(),
      JSON.stringify({ instanceId, pid: process.pid }, null, 2),
    )
  } catch (error) {
    logger.debug(
      { error: error instanceof Error ? error.message : String(error) },
      '[savant-free-session] Failed to record local owner',
    )
  }
}

export function isSavant-FreeInstanceOwnedByDeadLocalProcess(
  instanceId: string,
): boolean {
  const owner = readOwner()
  if (!owner || owner.instanceId !== instanceId) return false
  return !isProcessRunning(owner.pid)
}
