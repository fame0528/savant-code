import type { SavantCodeToolHandlerFunction } from '../handler-function-type'
import type {
  SavantCodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { AgentState } from '@savant-code/common/types/session-state'

export const handleSetMessages = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: SavantCodeToolCall<'set_messages'>

  agentState: AgentState
}): Promise<{ output: SavantToolOutput<'set_messages'> }> => {
  const { previousToolCallFinished, toolCall, agentState } = params

  await previousToolCallFinished
  agentState.messageHistory = toolCall.input.messages
  return { output: [{ type: 'json', value: { message: 'Messages set.' } }] }
}) satisfies SavantCodeToolHandlerFunction<'set_messages'>
