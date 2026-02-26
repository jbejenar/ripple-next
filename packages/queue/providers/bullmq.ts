import type { QueueProvider, QueueMessage, SendOptions, ReceiveOptions } from '../types'

/**
 * BullMQ queue provider for local development.
 * Requires Redis (via docker-compose).
 *
 * Note: BullMQ is a devDependency — only used in local dev,
 * not bundled for Lambda production.
 */
export class BullMQQueueProvider implements QueueProvider {
  private redisUrl: string

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl
  }

  async send<T>(queue: string, message: T, options?: SendOptions): Promise<string> {
    const { Queue } = await import('bullmq')
    const q = new Queue(queue, { connection: { url: this.redisUrl } })
    const job = await q.add(queue, message, {
      delay: options?.delaySeconds ? options.delaySeconds * 1000 : undefined
    })
    await q.close()
    return job.id ?? crypto.randomUUID()
  }

  async receive<T>(queue: string, _options?: ReceiveOptions): Promise<QueueMessage<T>[]> {
    const { Queue } = await import('bullmq')
    const q = new Queue(queue, { connection: { url: this.redisUrl } })
    const jobs = await q.getWaiting(0, 10)
    await q.close()
    return jobs.map((job) => ({
      id: job.id ?? '',
      body: job.data as T,
      timestamp: new Date(job.timestamp),
      attempts: job.attemptsMade
    }))
  }

  async delete(queue: string, messageId: string): Promise<void> {
    const { Queue } = await import('bullmq')
    const q = new Queue(queue, { connection: { url: this.redisUrl } })
    const job = await q.getJob(messageId)
    if (job) {
      await job.remove()
    }
    await q.close()
  }

  async purge(queue: string): Promise<void> {
    const { Queue } = await import('bullmq')
    const q = new Queue(queue, { connection: { url: this.redisUrl } })
    await q.drain()
    await q.close()
  }
}
