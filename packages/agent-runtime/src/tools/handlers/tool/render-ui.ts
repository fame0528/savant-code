import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'

export const handleRenderUI = (async ({
  previousToolCallFinished,
}: {
  previousToolCallFinished: Promise<unknown>
  toolCall: Savant-CodeToolCall<'render_ui'>
}): Promise<{ output: SavantToolOutput<'render_ui'> }> => {
  await previousToolCallFinished
  return { output: [{ type: 'json', value: { message: 'UI rendered.' } }] }
}) satisfies Savant-CodeToolHandlerFunction<'render_ui'>
