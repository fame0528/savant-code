import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  ClientToolCall,
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleBrowserLogs = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<'browser_logs'>
  requestClientToolCall: (
    toolCall: ClientToolCall<'browser_logs'>,
  ) => Promise<SavantToolOutput<'browser_logs'>>
}): Promise<{
  output: SavantToolOutput<'browser_logs'>
}> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished
  return { output: await requestClientToolCall(toolCall) }
}) satisfies Savant-CodeToolHandlerFunction<'browser_logs'>
