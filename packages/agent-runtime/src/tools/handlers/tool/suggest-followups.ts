import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { Logger } from '@savant-code/common/types/contracts/logger'

export const handleSuggestFollowups = (async (params: {
  previousToolCallFinished: Promise<unknown>
  toolCall: Savant-CodeToolCall<'suggest_followups'>
  logger: Logger
}): Promise<{ output: SavantToolOutput<'suggest_followups'> }> => {
  const { previousToolCallFinished, toolCall } = params
  const { followups: _followups } = toolCall.input

  await previousToolCallFinished
  return { output: [{ type: 'json', value: { message: 'Followups suggested!' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'suggest_followups'>
