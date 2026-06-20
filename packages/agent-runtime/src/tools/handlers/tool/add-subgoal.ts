import { buildArray } from '@savant-code/common/util/array'
import { jsonToolResult } from '@savant-code/common/util/messages'

import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { Subgoal } from '@savant-code/common/types/session-state'

export const handleAddSubgoal = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: Savant-CodeToolCall<'add_subgoal'>

  agentContext: Record<string, Subgoal>
}): Promise<{
  output: SavantToolOutput<'add_subgoal'>
}> => {
  const { previousToolCallFinished, toolCall, agentContext } = params

  agentContext[toolCall.input.id] = {
    objective: toolCall.input.objective,
    status: toolCall.input.status,
    plan: toolCall.input.plan,
    logs: buildArray([toolCall.input.log]),
  }

  await previousToolCallFinished
  return { output: jsonToolResult({ message: 'Successfully added subgoal' }) }
}) satisfies Savant-CodeToolHandlerFunction<'add_subgoal'>
