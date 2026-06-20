import { useQuery } from '@tanstack/react-query'

import { getAuthToken } from '../utils/auth'
import { getApiClient, setApiClientAuthToken } from '../utils/savant-code-api'
import { logger as defaultLogger } from '../utils/logger'

import type { SavantFreeStreakResponse } from '@savant-code/common/types/savant-free-streak'
import type { Logger } from '@savant-code/common/types/contracts/logger'

export const SavantFreeStreakQueryKeys = {
  all: ['SavantFreeStreak'] as const,
  current: () => [...SavantFreeStreakQueryKeys.all, 'current'] as const,
}

export async function fetchSavantFreeStreak(params: {
  authToken: string
  logger?: Logger
}): Promise<SavantFreeStreakResponse> {
  const { authToken, logger = defaultLogger } = params
  setApiClientAuthToken(authToken)
  const response = await getApiClient().get<SavantFreeStreakResponse>(
    '/api/v1/SavantFree/streak',
    { retry: false },
  )

  if (!response.ok) {
    logger.error(
      { status: response.status, error: response.error },
      'Failed to fetch SavantFree streak',
    )
    throw new Error(`Failed to fetch SavantFree streak (HTTP ${response.status})`)
  }

  if (!response.data) {
    throw new Error('Failed to fetch SavantFree streak: empty response')
  }

  return response.data
}

export function useSavantFreeStreakQuery(
  params: {
    enabled?: boolean
    logger?: Logger
  } = {},
) {
  const { enabled = true, logger = defaultLogger } = params
  const authToken = getAuthToken()

  return useQuery({
    queryKey: SavantFreeStreakQueryKeys.current(),
    queryFn: () => fetchSavantFreeStreak({ authToken: authToken!, logger }),
    enabled: enabled && !!authToken,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
