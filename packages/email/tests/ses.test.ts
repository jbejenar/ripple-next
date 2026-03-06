import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @aws-sdk/client-ses before importing the provider
const mockSend = vi.fn()
vi.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    SendEmailCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'SendEmail' })),
  }
})

import { SesEmailProvider } from '../providers/ses'

describe('SesEmailProvider', () => {
  let provider: SesEmailProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new SesEmailProvider('noreply@example.com')
  })

  describe('send', () => {
    it('sends an email and returns SentEmail with id', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-123' })

      const result = await provider.send({
        to: 'alice@example.com',
        subject: 'Hello',
        html: '<p>Hi Alice</p>',
      })

      expect(result.id).toBe('ses-msg-123')
      expect(result.sentAt).toBeInstanceOf(Date)
      expect(result.to).toBe('alice@example.com')
      expect(result.subject).toBe('Hello')
    })

    it('uses defaultFrom when no from is specified', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-456' })

      await provider.send({
        to: 'bob@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Source: 'noreply@example.com',
      })
    })

    it('uses provided from address over default', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-789' })

      await provider.send({
        to: 'bob@example.com',
        from: 'custom@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Source: 'custom@example.com',
      })
    })

    it('handles array of recipients', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-multi' })

      await provider.send({
        to: ['alice@example.com', 'bob@example.com'],
        subject: 'Group email',
        html: '<p>Hello everyone</p>',
      })

      const command = mockSend.mock.calls[0][0] as { _input: { Destination: { ToAddresses: string[] } } }
      expect(command._input.Destination.ToAddresses).toEqual([
        'alice@example.com',
        'bob@example.com',
      ])
    })

    it('includes text body when provided', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-text' })

      await provider.send({
        to: 'alice@example.com',
        subject: 'Plain text',
        html: '<p>HTML version</p>',
        text: 'Plain text version',
      })

      const command = mockSend.mock.calls[0][0] as { _input: { Message: { Body: { Text?: { Data: string } } } } }
      expect(command._input.Message.Body.Text).toEqual({ Data: 'Plain text version' })
    })

    it('includes replyTo when provided', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-reply' })

      await provider.send({
        to: 'alice@example.com',
        subject: 'Reply test',
        html: '<p>Test</p>',
        replyTo: 'reply@example.com',
      })

      const command = mockSend.mock.calls[0][0] as { _input: { ReplyToAddresses: string[] } }
      expect(command._input.ReplyToAddresses).toEqual(['reply@example.com'])
    })

    it('propagates AWS SDK errors', async () => {
      mockSend.mockRejectedValue(new Error('SES error: rate limit exceeded'))

      await expect(
        provider.send({
          to: 'alice@example.com',
          subject: 'Error test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('SES error: rate limit exceeded')
    })
  })
})
