import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleEndTurn = (async (params: {
  previousToolCallFinished: Promise<any>
  toolCall: Savant-CodeToolCall<'end_turn'>
}): Promise<{ output: SavantToolOutput<'end_turn'> }> => {
  const { previousToolCallFinished } = params

  await previousToolCallFinished
  return { output: [{ type: 'json', value: { message: 'Turn ended.' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'end_turn'>
