import type { SavantCodeToolHandlerFunction } from '../handler-function-type'
import type {
  SavantCodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

type ToolName = 'ask_user'

// Handler for ask_user - delegates to client
export const handleAskUser = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: SavantCodeToolCall<ToolName>
  requestClientToolCall: (toolCall: any) => Promise<any>
}): Promise<{ output: SavantToolOutput<ToolName> }> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished

  const result = await requestClientToolCall(toolCall as any)
  return {
    output: result,
  }
}) satisfies SavantCodeToolHandlerFunction<ToolName>
