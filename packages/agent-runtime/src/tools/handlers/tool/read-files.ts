import { jsonToolResult } from '@savant-code/common/util/messages'

import { getFileReadingUpdates } from '../../../get-file-reading-updates'
import { renderReadFilesResult } from '../../../util/render-read-files-result'

import type { Savant-CodeToolHandlerFunction } from '../handler-function-type'
import type {
  Savant-CodeToolCall,
  SavantToolOutput,
} from '@savant-code/common/tools/list'
import type { ParamsExcluding } from '@savant-code/common/types/function-params'
import type { ProjectFileContext } from '@savant-code/common/util/file'

type ToolName = 'read_files'
export const handleReadFiles = (async (
  params: {
    previousToolCallFinished: Promise<void>
    toolCall: Savant-CodeToolCall<ToolName>

    fileContext: ProjectFileContext
  } & ParamsExcluding<typeof getFileReadingUpdates, 'requestedFiles'>,
): Promise<{ output: SavantToolOutput<ToolName> }> => {
  const {
    previousToolCallFinished,
    toolCall,

    fileContext,
  } = params
  const { paths } = toolCall.input

  await previousToolCallFinished

  const addedFiles = await getFileReadingUpdates({
    ...params,
    requestedFiles: paths,
  })

  return {
    output: jsonToolResult(
      renderReadFilesResult(addedFiles, fileContext.tokenCallers ?? {}),
    ),
  }
}) satisfies Savant-CodeToolHandlerFunction<ToolName>
