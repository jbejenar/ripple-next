import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { EmailProvider, EmailMessage, SentEmail } from '../types'

/**
 * AWS SES email provider for production.
 */
export class SesEmailProvider implements EmailProvider {
  private client: SESClient
  private defaultFrom: string

  constructor(defaultFrom: string, region?: string) {
    this.client = new SESClient({ region: region ?? 'ap-southeast-2' })
    this.defaultFrom = defaultFrom
  }

  async send(message: EmailMessage): Promise<SentEmail> {
    const toAddresses = Array.isArray(message.to) ? message.to : [message.to]

    const result = await this.client.send(
      new SendEmailCommand({
        Source: message.from ?? this.defaultFrom,
        Destination: { ToAddresses: toAddresses },
        Message: {
          Subject: { Data: message.subject },
          Body: {
            Html: { Data: message.html },
            ...(message.text ? { Text: { Data: message.text } } : {})
          }
        },
        ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined
      })
    )

    return {
      ...message,
      id: result.MessageId!,
      sentAt: new Date()
    }
  }
}
