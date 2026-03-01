import { describe, it, expect } from 'vitest'
import { MemoryEmailProvider } from '@ripple-next/email'
import { createEmailHandler } from '../handlers/email.handler'
import type { SQSEvent } from 'aws-lambda'

function mockSQSEvent(body: unknown): SQSEvent {
  return {
    Records: [
      {
        messageId: crypto.randomUUID(),
        receiptHandle: 'test-receipt',
        body: JSON.stringify(body),
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: '',
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:ap-southeast-2:123456789:test-queue',
        awsRegion: 'ap-southeast-2'
      }
    ]
  }
}

describe('email.handler', () => {
  it('sends email from SQS event', async () => {
    const emailProvider = new MemoryEmailProvider()
    const handler = createEmailHandler({ emailProvider })

    const event = mockSQSEvent({
      type: 'send-email',
      to: 'user@example.com',
      template: 'welcome',
      data: { name: 'Test User' }
    })

    await handler(event)

    expect(emailProvider.sent).toHaveLength(1)
    expect(emailProvider.sent[0].to).toBe('user@example.com')
  })

  it('handles multiple records in a batch', async () => {
    const emailProvider = new MemoryEmailProvider()
    const handler = createEmailHandler({ emailProvider })

    const event: SQSEvent = {
      Records: [
        {
          messageId: '1',
          receiptHandle: 'r1',
          body: JSON.stringify({
            type: 'send-email',
            to: 'a@test.com',
            template: 'welcome',
            data: {}
          }),
          attributes: {} as never,
          messageAttributes: {},
          md5OfBody: '',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:test',
          awsRegion: 'ap-southeast-2'
        },
        {
          messageId: '2',
          receiptHandle: 'r2',
          body: JSON.stringify({
            type: 'send-email',
            to: 'b@test.com',
            template: 'reset',
            data: {}
          }),
          attributes: {} as never,
          messageAttributes: {},
          md5OfBody: '',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:test',
          awsRegion: 'ap-southeast-2'
        }
      ]
    }

    await handler(event)
    expect(emailProvider.sent).toHaveLength(2)
  })
})
