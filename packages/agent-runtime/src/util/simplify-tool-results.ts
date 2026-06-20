import { getErrorObject } from '@savant-code/common/util/error'
import { cloneDeep } from 'lodash'

import type { SavantToolOutput } from '@savant-code/common/tools/list'
import type { Logger } from '@savant-code/common/types/contracts/logger'

export function simplifyReadFileResults(
  messageContent: SavantToolOutput<'read_files'>,
): SavantToolOutput<'read_files'> {
  return [
    {
      type: 'json',
      value: cloneDeep(messageContent[0]).value.map(({ path }) => {
        return {
          path,
          contentOmittedForLength: true,
        }
      }),
    },
  ]
}

export function simplifyTerminalCommandResults(params: {
  messageContent: SavantToolOutput<'run_terminal_command'>
  logger: Logger
}): SavantToolOutput<'run_terminal_command'> {
  const { messageContent, logger } = params
  try {
    const clone = cloneDeep(messageContent)
    const content = clone[0].value
    if ('processId' in content || 'errorMessage' in content) {
      return clone
    }
    const { command, message, exitCode } = content
    return [
      {
        type: 'json',
        value: {
          command,
          ...(message && { message }),
          stdoutOmittedForLength: true,
          ...(exitCode !== undefined && { exitCode }),
        },
      },
    ]
  } catch (error) {
    logger.error(
      { error: getErrorObject(error), messageContent },
      'Error simplifying terminal command results',
    )
    return [
      {
        type: 'json',
        value: {
          command: '',
          stdoutOmittedForLength: true,
        },
      },
    ]
  }
}
