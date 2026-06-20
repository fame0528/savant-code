import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { Logger } from '@savant-code/common/types/contracts/logger'

export const handleThinkDeeply = (async (params: {
  previousToolCallFinished: Promise<any>
  toolCall: Savant-CodeToolCall<'think_deeply'>
  logger: Logger
}): Promise<{ output: SavantToolOutput<'think_deeply'> }> => {
  const { previousToolCallFinished, toolCall, logger } = params
  const { thought } = toolCall.input

  logger.debug(
    {
      thought,
    },
    'Thought deeply',
  )

  await previousToolCallFinished
  return { output: [{ type: 'json', value: { message: 'Thought logged.' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'think_deeply'>
