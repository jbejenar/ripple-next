import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryQueueProvider } from '../providers/memory'

describe('MemoryQueueProvider', () => {
  let queue: MemoryQueueProvider

  beforeEach(() => {
    queue = new MemoryQueueProvider()
  })

  it('sends and receives messages', async () => {
    await queue.send('test-queue', { type: 'test', data: 'hello' })
    const messages = await queue.receive('test-queue')
    expect(messages).toHaveLength(1)
    expect(messages[0].body).toEqual({ type: 'test', data: 'hello' })
  })

  it('generates unique message IDs', async () => {
    const id1 = await queue.send('test-queue', { msg: 1 })
    const id2 = await queue.send('test-queue', { msg: 2 })
    expect(id1).not.toBe(id2)
  })

  it('deletes messages', async () => {
    const id = await queue.send('test-queue', { data: 'to-delete' })
    await queue.delete('test-queue', id)
    const messages = await queue.receive('test-queue')
    expect(messages).toHaveLength(0)
  })

  it('purges queue', async () => {
    await queue.send('test-queue', { msg: 1 })
    await queue.send('test-queue', { msg: 2 })
    await queue.purge('test-queue')
    expect(queue.getMessageCount('test-queue')).toBe(0)
  })

  it('handles multiple queues independently', async () => {
    await queue.send('queue-a', { queue: 'a' })
    await queue.send('queue-b', { queue: 'b' })
    expect(queue.getMessageCount('queue-a')).toBe(1)
    expect(queue.getMessageCount('queue-b')).toBe(1)
  })

  it('returns empty array for non-existent queue', async () => {
    const messages = await queue.receive('nonexistent')
    expect(messages).toHaveLength(0)
  })
})
