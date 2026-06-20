import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { AgentState } from '@savant-code/common/types/session-state'

export const handleSetMessages = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<'set_messages'>

  agentState: AgentState
}): Promise<{ output: SavantToolOutput<'set_messages'> }> => {
  const { previousToolCallFinished, toolCall, agentState } = params

  await previousToolCallFinished
  agentState.messageHistory = toolCall.input.messages
  return { output: [{ type: 'json', value: { message: 'Messages set.' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'set_messages'>
