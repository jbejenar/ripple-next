import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock bullmq
const mockAdd = vi.fn()
const mockGetWaiting = vi.fn()
const mockGetJob = vi.fn()
const mockDrain = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)

vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation(() => ({
      add: mockAdd,
      getWaiting: mockGetWaiting,
      getJob: mockGetJob,
      drain: mockDrain,
      close: mockClose,
    })),
  }
})

import { BullMQQueueProvider } from '../providers/bullmq'

describe('BullMQQueueProvider', () => {
  let provider: BullMQQueueProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new BullMQQueueProvider('redis://localhost:6379')
  })

  describe('send', () => {
    it('enqueues a message and returns job id', async () => {
      mockAdd.mockResolvedValue({ id: 'job-123' })

      const id = await provider.send('test-queue', { type: 'test' })

      expect(id).toBe('job-123')
      expect(mockAdd).toHaveBeenCalledWith('test-queue', { type: 'test' }, { delay: undefined })
      expect(mockClose).toHaveBeenCalled()
    })

    it('passes delay option', async () => {
      mockAdd.mockResolvedValue({ id: 'job-456' })

      await provider.send('test-queue', { data: 1 }, { delaySeconds: 5 })

      expect(mockAdd).toHaveBeenCalledWith('test-queue', { data: 1 }, { delay: 5000 })
    })

    it('generates UUID when job has no id', async () => {
      mockAdd.mockResolvedValue({ id: undefined })

      const id = await provider.send('test-queue', {})

      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })
  })

  describe('receive', () => {
    it('returns waiting jobs as QueueMessages', async () => {
      const now = Date.now()
      mockGetWaiting.mockResolvedValue([
        { id: 'job-1', data: { type: 'a' }, timestamp: now, attemptsMade: 1 },
        { id: 'job-2', data: { type: 'b' }, timestamp: now, attemptsMade: 0 },
      ])

      const messages = await provider.receive('test-queue')

      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe('job-1')
      expect(messages[0].body).toEqual({ type: 'a' })
      expect(messages[0].attempts).toBe(1)
      expect(messages[1].id).toBe('job-2')
      expect(mockClose).toHaveBeenCalled()
    })

    it('returns empty array when no waiting jobs', async () => {
      mockGetWaiting.mockResolvedValue([])

      const messages = await provider.receive('test-queue')

      expect(messages).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('removes a job by id', async () => {
      const mockRemove = vi.fn().mockResolvedValue(undefined)
      mockGetJob.mockResolvedValue({ remove: mockRemove })

      await provider.delete('test-queue', 'job-1')

      expect(mockGetJob).toHaveBeenCalledWith('job-1')
      expect(mockRemove).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('handles non-existent job gracefully', async () => {
      mockGetJob.mockResolvedValue(null)

      await provider.delete('test-queue', 'nonexistent')

      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('purge', () => {
    it('drains the queue', async () => {
      mockDrain.mockResolvedValue(undefined)

      await provider.purge('test-queue')

      expect(mockDrain).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
