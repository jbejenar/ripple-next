import { MemoryQueueProvider, type QueueMessage } from '@ripple-next/queue'

/**
 * Assert that a queue has a specific number of messages.
 */
export function assertQueueLength(
  queue: MemoryQueueProvider,
  name: string,
  expected: number
): void {
  const count = queue.getMessageCount(name)
  if (count !== expected) {
    throw new Error(`Expected queue "${name}" to have ${expected} messages, but found ${count}`)
  }
}

/**
 * Get messages from a memory queue typed.
 */
export function getQueueMessages<T>(queue: MemoryQueueProvider, name: string): QueueMessage<T>[] {
  return queue.getMessages<T>(name)
}
