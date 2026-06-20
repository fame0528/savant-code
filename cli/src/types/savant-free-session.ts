export type { SavantFreeSessionServerResponse } from '@savant-code/common/types/savant-free-session'

import type { SavantFreeSessionServerResponse } from '@savant-code/common/types/savant-free-session'

/**
 * CLI session shape. Most states are wire-level `/api/v1/SavantFree/session`
 * responses; `takeover_prompt` is local-only so startup can ask before POSTing
 * and rotating another running CLI's instance id.
 */
export type SavantFreeSessionResponse =
  | SavantFreeSessionServerResponse
  | {
      status: 'takeover_prompt'
      model: string
    }

export type SavantFreeSessionStatus = SavantFreeSessionResponse['status']
