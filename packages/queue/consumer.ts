import type { QueueProvider, QueueMessage } from './types'

export interface ConsumerOptions {
  queue: string
  pollInterval?: number
  maxRetries?: number
}

export type MessageHandler<T> = (message: QueueMessage<T>) => Promise<void>

/**
 * Generic queue consumer with error handling and retry logic.
 * Works with any QueueProvider implementation.
 */
export async function consumeMessages<T>(
  provider: QueueProvider,
  handler: MessageHandler<T>,
  options: ConsumerOptions
): Promise<void> {
  const { queue, maxRetries = 3 } = options

  const messages = await provider.receive<T>(queue)

  for (const message of messages) {
    if (message.attempts > maxRetries) {
      // Move to DLQ logic would go here
      await provider.delete(queue, message.id)
      continue
    }

    try {
      await handler(message)
      await provider.delete(queue, message.id)
    } catch (error) {
      console.error(`Error processing message ${message.id}:`, error)
      // Message will become visible again after visibility timeout
    }
  }
}
