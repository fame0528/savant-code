import { SAVANT_FREE_MINIMAX_M3_MODEL_ID } from '@savant-code/common/constants/savant-free-models'

import { publisher } from '../constants'
import type { SecretAgentDefinition } from '../types/secret-agent-definition'
import { createReviewer } from './code-reviewer'

const definition: SecretAgentDefinition = {
  id: 'code-reviewer-minimax-m3',
  publisher,
  ...createReviewer(SAVANT_FREE_MINIMAX_M3_MODEL_ID),
}

export default definition
