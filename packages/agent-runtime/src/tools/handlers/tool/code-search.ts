import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  ClientToolCall,
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleCodeSearch = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<'code_search'>
  requestClientToolCall: (
    toolCall: ClientToolCall<'code_search'>,
  ) => Promise<SavantToolOutput<'code_search'>>
}): Promise<{
  output: SavantToolOutput<'code_search'>
}> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished
  return { output: await requestClientToolCall(toolCall) }
}) satisfies Savant-CodeToolHandlerFunction<'code_search'>
