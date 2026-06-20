import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  ClientToolCall,
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleReadUrl = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<'read_url'>
  requestClientToolCall: (
    toolCall: ClientToolCall<'read_url'>,
  ) => Promise<SavantToolOutput<'read_url'>>
}): Promise<{
  output: SavantToolOutput<'read_url'>
}> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished
  return { output: await requestClientToolCall(toolCall) }
}) satisfies Savant-CodeToolHandlerFunction<'read_url'>
