import { getSavant-FreeRootAgentIdForModel } from '@savant-code/common/constants/free-agents'

import { getSelectedSavant-FreeModel } from '../state/savant-free-model-store'
import { AGENT_MODE_TO_ID, IS_SAVANT_FREE, type AgentMode } from './constants'

export function getAgentIdForMode(agentMode: AgentMode): string {
  if (IS_SAVANT_FREE && agentMode === 'LITE') {
    return getSavant-FreeRootAgentIdForModel(getSelectedSavant-FreeModel())
  }

  return AGENT_MODE_TO_ID[agentMode]
}
