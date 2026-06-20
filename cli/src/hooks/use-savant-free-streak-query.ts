import { useQuery } from '@tanstack/react-query'

import { getAuthToken } from '../utils/auth'
import { getApiClient, setApiClientAuthToken } from '../utils/savant-code-api'
import { logger as defaultLogger } from '../utils/logger'

import type { Savant-FreeStreakResponse } from '@savant-code/common/types/savant-free-streak'
import type { Logger } from '@savant-code/common/types/contracts/logger'

export const savant-freeStreakQueryKeys = {
  all: ['savant-freeStreak'] as const,
  current: () => [...savant-freeStreakQueryKeys.all, 'current'] as const,
}

export async function fetchSavant-FreeStreak(params: {
  authToken: string
  logger?: Logger
}): Promise<Savant-FreeStreakResponse> {
  const { authToken, logger = defaultLogger } = params
  setApiClientAuthToken(authToken)
  const response = await getApiClient().get<Savant-FreeStreakResponse>(
    '/api/v1/savant-free/streak',
    { retry: false },
  )

  if (!response.ok) {
    logger.error(
      { status: response.status, error: response.error },
      'Failed to fetch savant-free streak',
    )
    throw new Error(`Failed to fetch savant-free streak (HTTP ${response.status})`)
  }

  if (!response.data) {
    throw new Error('Failed to fetch savant-free streak: empty response')
  }

  return response.data
}

export function useSavant-FreeStreakQuery(
  params: {
    enabled?: boolean
    logger?: Logger
  } = {},
) {
  const { enabled = true, logger = defaultLogger } = params
  const authToken = getAuthToken()

  return useQuery({
    queryKey: savant-freeStreakQueryKeys.current(),
    queryFn: () => fetchSavant-FreeStreak({ authToken: authToken!, logger }),
    enabled: enabled && !!authToken,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
