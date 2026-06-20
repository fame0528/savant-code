import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  ClientToolCall,
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

type ToolName = 'glob'
export const handleGlob = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<ToolName>
  requestClientToolCall: (
    toolCall: ClientToolCall<ToolName>,
  ) => Promise<SavantToolOutput<ToolName>>
}): Promise<{
  output: SavantToolOutput<ToolName>
}> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished
  return { output: await requestClientToolCall(toolCall) }
}) satisfies Savant-CodeToolHandlerFunction<ToolName>
