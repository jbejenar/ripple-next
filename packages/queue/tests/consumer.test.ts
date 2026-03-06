import { describe, it, expect, vi, beforeEach } from 'vitest'
import { consumeMessages } from '../consumer'
import type { QueueProvider, QueueMessage } from '../types'
import type { MessageHandler } from '../consumer'

function createMockProvider(messages: QueueMessage<unknown>[] = []): QueueProvider {
  return {
    send: vi.fn().mockResolvedValue('mock-id'),
    receive: vi.fn().mockResolvedValue(messages),
    delete: vi.fn().mockResolvedValue(undefined),
    purge: vi.fn().mockResolvedValue(undefined),
  }
}

function makeMessage<T>(body: T, overrides?: Partial<QueueMessage<T>>): QueueMessage<T> {
  return {
    id: overrides?.id ?? 'msg-1',
    body,
    timestamp: overrides?.timestamp ?? new Date(),
    attempts: overrides?.attempts ?? 0,
  }
}

describe('consumeMessages', () => {
  let provider: QueueProvider
  let handler: MessageHandler<{ type: string }>

  beforeEach(() => {
    handler = vi.fn().mockResolvedValue(undefined)
  })

  it('processes messages and deletes them on success', async () => {
    const msg = makeMessage({ type: 'test' })
    provider = createMockProvider([msg])

    await consumeMessages(provider, handler, { queue: 'test-queue' })

    expect(handler).toHaveBeenCalledWith(msg)
    expect(provider.delete).toHaveBeenCalledWith('test-queue', 'msg-1')
  })

  it('processes multiple messages in order', async () => {
    const msgs = [
      makeMessage({ type: 'a' }, { id: 'msg-1', attempts: 0 }),
      makeMessage({ type: 'b' }, { id: 'msg-2', attempts: 0 }),
    ]
    provider = createMockProvider(msgs)

    await consumeMessages(provider, handler, { queue: 'test-queue' })

    expect(handler).toHaveBeenCalledTimes(2)
    expect(provider.delete).toHaveBeenCalledTimes(2)
  })

  it('does not delete message when handler throws', async () => {
    const msg = makeMessage({ type: 'fail' })
    provider = createMockProvider([msg])
    const failingHandler: MessageHandler<{ type: string }> = vi.fn().mockRejectedValue(new Error('handler error'))

    await consumeMessages(provider, failingHandler, { queue: 'test-queue' })

    expect(provider.delete).not.toHaveBeenCalled()
  })

  it('deletes messages that exceed maxRetries (DLQ routing)', async () => {
    const msg = makeMessage({ type: 'exhausted' }, { id: 'msg-dlq', attempts: 4 })
    provider = createMockProvider([msg])

    await consumeMessages(provider, handler, { queue: 'test-queue', maxRetries: 3 })

    // Should delete without calling handler
    expect(handler).not.toHaveBeenCalled()
    expect(provider.delete).toHaveBeenCalledWith('test-queue', 'msg-dlq')
  })

  it('processes messages at exactly maxRetries', async () => {
    const msg = makeMessage({ type: 'at-limit' }, { id: 'msg-limit', attempts: 3 })
    provider = createMockProvider([msg])

    await consumeMessages(provider, handler, { queue: 'test-queue', maxRetries: 3 })

    // attempts === maxRetries means it hasn't exceeded, so it should be processed
    expect(handler).toHaveBeenCalledWith(msg)
  })

  it('defaults maxRetries to 3', async () => {
    const msg = makeMessage({ type: 'high-attempts' }, { id: 'msg-4', attempts: 4 })
    provider = createMockProvider([msg])

    await consumeMessages(provider, handler, { queue: 'test-queue' })

    expect(handler).not.toHaveBeenCalled()
    expect(provider.delete).toHaveBeenCalledWith('test-queue', 'msg-4')
  })

  it('handles empty queue gracefully', async () => {
    provider = createMockProvider([])

    await consumeMessages(provider, handler, { queue: 'test-queue' })

    expect(handler).not.toHaveBeenCalled()
    expect(provider.delete).not.toHaveBeenCalled()
  })

  it('continues processing remaining messages after handler error', async () => {
    const msgs = [
      makeMessage({ type: 'fail' }, { id: 'msg-fail', attempts: 0 }),
      makeMessage({ type: 'ok' }, { id: 'msg-ok', attempts: 0 }),
    ]
    provider = createMockProvider(msgs)

    let callCount = 0
    const mixedHandler: MessageHandler<{ type: string }> = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new Error('first fails'))
      return Promise.resolve()
    })

    await consumeMessages(provider, mixedHandler, { queue: 'test-queue' })

    expect(mixedHandler).toHaveBeenCalledTimes(2)
    // Only second message should be deleted
    expect(provider.delete).toHaveBeenCalledTimes(1)
    expect(provider.delete).toHaveBeenCalledWith('test-queue', 'msg-ok')
  })
})
