/**
 * Queue Provider Conformance Suite
 *
 * Every QueueProvider implementation must pass these tests.
 * Import this in your provider's test file and call it with a factory.
 *
 * @example
 * ```ts
 * import { queueConformance } from '@ripple/testing/conformance/queue.conformance'
 * import { MemoryQueueProvider } from '@ripple/queue'
 *
 * queueConformance({
 *   name: 'MemoryQueueProvider',
 *   factory: () => new MemoryQueueProvider(),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { QueueProvider } from '@ripple/queue'

interface QueueConformanceOptions {
  name: string
  factory: () => QueueProvider
  cleanup?: () => Promise<void>
}

export function queueConformance({ name, factory, cleanup }: QueueConformanceOptions): void {
  describe(`QueueProvider conformance: ${name}`, () => {
    let provider: QueueProvider
    const testQueue = 'conformance-test-queue'

    beforeEach(async () => {
      provider = factory()
      await provider.purge(testQueue)
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('send() returns a message id', async () => {
      const id = await provider.send(testQueue, { hello: 'world' })
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })

    it('receive() returns sent messages', async () => {
      await provider.send(testQueue, { value: 1 })
      await provider.send(testQueue, { value: 2 })

      const messages = await provider.receive<{ value: number }>(testQueue, { maxMessages: 10 })
      expect(messages.length).toBeGreaterThanOrEqual(2)

      const bodies = messages.map((m) => m.body)
      expect(bodies).toContainEqual({ value: 1 })
      expect(bodies).toContainEqual({ value: 2 })
    })

    it('receive() returns messages with required fields', async () => {
      await provider.send(testQueue, { data: 'test' })
      const [msg] = await provider.receive(testQueue)

      expect(msg).toBeDefined()
      expect(msg.id).toBeTruthy()
      expect(msg.body).toEqual({ data: 'test' })
      expect(msg.timestamp).toBeInstanceOf(Date)
      expect(typeof msg.attempts).toBe('number')
    })

    it('delete() removes a message from the queue', async () => {
      await provider.send(testQueue, { to_delete: true })
      const [msg] = await provider.receive(testQueue)
      expect(msg).toBeDefined()

      await provider.delete(testQueue, msg.id)

      const remaining = await provider.receive(testQueue)
      const ids = remaining.map((m) => m.id)
      expect(ids).not.toContain(msg.id)
    })

    it('purge() removes all messages', async () => {
      await provider.send(testQueue, { a: 1 })
      await provider.send(testQueue, { b: 2 })
      await provider.send(testQueue, { c: 3 })

      await provider.purge(testQueue)

      const messages = await provider.receive(testQueue)
      expect(messages).toHaveLength(0)
    })

    it('receive() returns empty array for empty queue', async () => {
      const messages = await provider.receive(testQueue)
      expect(messages).toEqual([])
    })

    it('handles distinct queue names independently', async () => {
      await provider.send('queue-a', { from: 'a' })
      await provider.send('queue-b', { from: 'b' })

      const msgsA = await provider.receive<{ from: string }>('queue-a')
      const msgsB = await provider.receive<{ from: string }>('queue-b')

      expect(msgsA.map((m) => m.body.from)).toContain('a')
      expect(msgsA.map((m) => m.body.from)).not.toContain('b')
      expect(msgsB.map((m) => m.body.from)).toContain('b')

      // Cleanup
      await provider.purge('queue-a')
      await provider.purge('queue-b')
    })
  })
}
