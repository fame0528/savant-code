import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleTaskCompleted = (async ({
  previousToolCallFinished,
}: {
  previousToolCallFinished: Promise<any>
  toolCall: Savant-CodeToolCall<'task_completed'>
}): Promise<{ output: SavantToolOutput<'task_completed'> }> => {
  await previousToolCallFinished
  return { output: [{ type: 'json', value: { message: 'Task completed.' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'task_completed'>
