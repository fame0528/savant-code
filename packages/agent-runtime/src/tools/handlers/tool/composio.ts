import type { ComposioMetaToolName } from '@savant-code/common/constants/composio'
import type { SavantToolOutput } from '@savant-code/common/tools/list'
import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'

function makeComposioHandler<
  T extends ComposioMetaToolName,
>(): Savant-CodeToolHandlerFunction<T> {
  return async ({ toolCall, requestClientToolCall }) => {
    if (!requestClientToolCall) {
      return {
        output: [
          {
            type: 'json',
            value: {
              errorMessage: 'Composio tools are not available in this runtime.',
            },
          },
        ],
      }
    }

    return {
      output: (await (requestClientToolCall as any)(
        toolCall,
      )) as SavantToolOutput<T>,
    }
  }
}

export const handleComposioManageConnections: Savant-CodeToolHandlerFunction<'composio_manage_connections'> =
  makeComposioHandler<'composio_manage_connections'>()
export const handleComposioMultiExecute: Savant-CodeToolHandlerFunction<'composio_multi_execute_tool'> =
  makeComposioHandler<'composio_multi_execute_tool'>()
export const handleComposioSearchTools: Savant-CodeToolHandlerFunction<'composio_search_tools'> =
  makeComposioHandler<'composio_search_tools'>()
export const handleComposioGetToolSchemas: Savant-CodeToolHandlerFunction<'composio_get_tool_schemas'> =
  makeComposioHandler<'composio_get_tool_schemas'>()
