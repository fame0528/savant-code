import { SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID } from '@savant-code/common/constants/savant-free-models'

import { publisher } from '../constants'
import type { SecretAgentDefinition } from '../types/secret-agent-definition'
import { createReviewer } from './code-reviewer'

const definition: SecretAgentDefinition = {
  id: 'code-reviewer-deepseek-flash',
  publisher,
  ...createReviewer(SAVANT_FREE_DEEPSEEK_V4_FLASH_MODEL_ID),
}

export default definition
