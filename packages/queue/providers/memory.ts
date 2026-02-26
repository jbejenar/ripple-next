import type { QueueProvider, QueueMessage, SendOptions, ReceiveOptions } from '../types'

/**
 * In-memory queue provider for tests.
 * Zero dependencies, 100% synchronous.
 */
export class MemoryQueueProvider implements QueueProvider {
  private queues = new Map<string, QueueMessage[]>()

  async send<T>(queue: string, message: T, _options?: SendOptions): Promise<string> {
    const id = crypto.randomUUID()
    const q = this.queues.get(queue) ?? []
    q.push({
      id,
      body: message as unknown,
      timestamp: new Date(),
      attempts: 0
    })
    this.queues.set(queue, q)
    return id
  }

  async receive<T>(queue: string, options?: ReceiveOptions): Promise<QueueMessage<T>[]> {
    const q = this.queues.get(queue) ?? []
    const max = options?.maxMessages ?? 10
    return q.slice(0, max) as QueueMessage<T>[]
  }

  async delete(queue: string, messageId: string): Promise<void> {
    const q = this.queues.get(queue) ?? []
    const idx = q.findIndex((m) => m.id === messageId)
    if (idx !== -1) {
      q.splice(idx, 1)
    }
  }

  async purge(queue: string): Promise<void> {
    this.queues.set(queue, [])
  }

  // Test helpers
  getMessages<T>(queue: string): QueueMessage<T>[] {
    return (this.queues.get(queue) ?? []) as QueueMessage<T>[]
  }

  getMessageCount(queue: string): number {
    return (this.queues.get(queue) ?? []).length
  }

  clear(): void {
    this.queues.clear()
  }
}
