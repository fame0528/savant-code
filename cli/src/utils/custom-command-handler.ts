import { defineCommandWithArgs } from '../commands/command-registry'
import { logger } from './logger'
import { capturePendingAttachments } from './pending-attachments'
import { getSystemMessage, getUserMessage } from './message-history'

import { renderCustomCommand } from '@savant-code/common/util/custom-command-template'
import type { CustomCommand } from '@savant-code/common/types/custom-command'

/**
 * Creates a dynamic command definition for a custom command (FID-2026-0620-005).
 * When invoked, the command's body is rendered with placeholder substitution
 * and sent to the agent.
 */
export function createCustomCommandHandler(
  command: CustomCommand,
): ReturnType<typeof defineCommandWithArgs> {
  return defineCommandWithArgs({
    name: command.name,
    handler: (params, args) => {
      const trimmed = params.inputValue.trim()
      params.saveToHistory(trimmed)
      params.setInputValue({ text: '', cursorPosition: 0, lastEditDueToNav: false })

      // Render the prompt with template substitution
      let rendered: string
      try {
        rendered = renderCustomCommand(command, args)
      } catch (err) {
        logger.warn(
          { err, command: command.name },
          'Failed to render custom command template',
        )
        params.setMessages((prev) => [
          ...prev,
          getUserMessage(trimmed),
          getSystemMessage(
            `Failed to render custom command '/${command.name}': ${(err as Error).message}`,
          ),
        ])
        return
      }

      // Check streaming/queue state (mirror of skill command handler)
      if (
        params.isStreaming ||
        params.streamMessageIdRef.current ||
        params.isChainInProgressRef.current
      ) {
        const pendingAttachments = capturePendingAttachments()
        params.addToQueue(rendered, pendingAttachments)
        params.setInputFocused(true)
        params.inputRef.current?.focus()
        return
      }

      params.sendMessage({
        content: rendered,
        agentMode: params.agentMode,
      })
      setTimeout(() => {
        params.scrollToLatest()
      }, 0)
    },
  })
}
