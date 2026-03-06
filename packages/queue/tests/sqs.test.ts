import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @aws-sdk/client-sqs before importing the provider
const mockSend = vi.fn()
vi.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    SendMessageCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'SendMessage' })),
    ReceiveMessageCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'ReceiveMessage' })),
    DeleteMessageCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'DeleteMessage' })),
    PurgeQueueCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'PurgeQueue' })),
  }
})

import { SqsQueueProvider } from '../providers/sqs'

describe('SqsQueueProvider', () => {
  let provider: SqsQueueProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new SqsQueueProvider({
      'test-queue': 'https://sqs.ap-southeast-2.amazonaws.com/123456789/test-queue',
    })
  })

  describe('send', () => {
    it('sends a message and returns the MessageId', async () => {
      mockSend.mockResolvedValue({ MessageId: 'sqs-msg-123' })

      const id = await provider.send('test-queue', { type: 'test', data: 'hello' })

      expect(id).toBe('sqs-msg-123')
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('passes delaySeconds and deduplication options', async () => {
      mockSend.mockResolvedValue({ MessageId: 'sqs-msg-456' })

      await provider.send('test-queue', { data: 1 }, {
        delaySeconds: 10,
        deduplicationId: 'dedup-1',
        groupId: 'group-1',
      })

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/123456789/test-queue',
        DelaySeconds: 10,
        MessageDeduplicationId: 'dedup-1',
        MessageGroupId: 'group-1',
      })
    })

    it('throws for unknown queue name', async () => {
      await expect(provider.send('unknown-queue', {})).rejects.toThrow('Unknown queue: unknown-queue')
    })
  })

  describe('receive', () => {
    it('returns parsed messages', async () => {
      mockSend.mockResolvedValue({
        Messages: [
          {
            ReceiptHandle: 'receipt-1',
            Body: '{"type":"test"}',
            Attributes: { ApproximateReceiveCount: '2' },
          },
        ],
      })

      const messages = await provider.receive('test-queue')

      expect(messages).toHaveLength(1)
      expect(messages[0].id).toBe('receipt-1')
      expect(messages[0].body).toEqual({ type: 'test' })
      expect(messages[0].attempts).toBe(2)
    })

    it('returns empty array when no messages', async () => {
      mockSend.mockResolvedValue({ Messages: undefined })

      const messages = await provider.receive('test-queue')

      expect(messages).toHaveLength(0)
    })

    it('passes receive options', async () => {
      mockSend.mockResolvedValue({ Messages: [] })

      await provider.receive('test-queue', {
        maxMessages: 5,
        waitTimeSeconds: 10,
        visibilityTimeout: 30,
      })

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10,
        VisibilityTimeout: 30,
      })
    })

    it('uses defaults for maxMessages and waitTimeSeconds', async () => {
      mockSend.mockResolvedValue({ Messages: [] })

      await provider.receive('test-queue')

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      })
    })
  })

  describe('delete', () => {
    it('deletes a message by receipt handle', async () => {
      mockSend.mockResolvedValue({})

      await provider.delete('test-queue', 'receipt-handle-1')

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/123456789/test-queue',
        ReceiptHandle: 'receipt-handle-1',
      })
    })
  })

  describe('purge', () => {
    it('purges the queue', async () => {
      mockSend.mockResolvedValue({})

      await provider.purge('test-queue')

      expect(mockSend).toHaveBeenCalledTimes(1)
      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/123456789/test-queue',
      })
    })
  })

  describe('error handling', () => {
    it('propagates AWS SDK errors on send', async () => {
      mockSend.mockRejectedValue(new Error('AWS error'))

      await expect(provider.send('test-queue', {})).rejects.toThrow('AWS error')
    })

    it('propagates AWS SDK errors on receive', async () => {
      mockSend.mockRejectedValue(new Error('AWS timeout'))

      await expect(provider.receive('test-queue')).rejects.toThrow('AWS timeout')
    })
  })
})
