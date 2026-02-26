/**
 * ECS Fargate entry point for long-running queue consumers.
 * This process runs continuously and polls queues.
 */

import { consumeMessages, type QueueProvider } from '@ripple/queue'
import { sleep } from '@ripple/shared'

async function startWorker(): Promise<void> {
  console.log('Starting long-running worker...')

  // In production, use SQS provider via SST Resource
  // In local dev, use BullMQ provider via docker-compose Redis
  const provider = await createProvider()

  // Continuous polling loop
  while (true) {
    try {
      await consumeMessages(provider, async (message) => {
        console.log(`Processing message: ${message.id}`, message.body)
        // Dispatch to appropriate handler based on message type
      }, { queue: 'long-running' })
    } catch (error) {
      console.error('Worker error:', error)
    }

    await sleep(1000)
  }
}

async function createProvider(): Promise<QueueProvider> {
  const env = process.env.QUEUE_PROVIDER ?? 'memory'

  if (env === 'sqs') {
    const { SqsQueueProvider } = await import('@ripple/queue')
    return new SqsQueueProvider({})
  }

  if (env === 'bullmq') {
    const { BullMQQueueProvider } = await import('@ripple/queue')
    return new BullMQQueueProvider(process.env.REDIS_URL ?? 'redis://localhost:6379')
  }

  const { MemoryQueueProvider } = await import('@ripple/queue')
  return new MemoryQueueProvider()
}

startWorker().catch((err) => {
  console.error('Fatal worker error:', err)
  process.exit(1)
})
