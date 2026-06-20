import { SAVANT_FREE_MIMO_V25_MODEL_ID } from '@savant-code/common/constants/savant-free-models'

import { publisher } from '../constants'
import type { SecretAgentDefinition } from '../types/secret-agent-definition'
import { createReviewer } from './code-reviewer'

const definition: SecretAgentDefinition = {
  id: 'code-reviewer-mimo',
  publisher,
  ...createReviewer(SAVANT_FREE_MIMO_V25_MODEL_ID),
}

export default definition
