import { createTransport, type Transporter } from 'nodemailer'
import type { EmailProvider, EmailMessage, SentEmail } from '../types'

/**
 * SMTP email provider for local development.
 * Use with Mailpit (captures emails locally for inspection).
 */
export class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter

  constructor(host: string = 'localhost', port: number = 1025) {
    this.transporter = createTransport({
      host,
      port,
      secure: false
    })
  }

  async send(message: EmailMessage): Promise<SentEmail> {
    const result = await this.transporter.sendMail({
      from: message.from ?? 'noreply@ripple.dev',
      to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      attachments: message.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType
      }))
    })

    return {
      ...message,
      id: result.messageId,
      sentAt: new Date()
    }
  }
}

/**
 * In-memory email provider for tests.
 * Stores all sent emails for assertion.
 */
export class MemoryEmailProvider implements EmailProvider {
  public sent: SentEmail[] = []

  async send(message: EmailMessage): Promise<SentEmail> {
    const email: SentEmail = {
      ...message,
      id: crypto.randomUUID(),
      sentAt: new Date()
    }
    this.sent.push(email)
    return email
  }

  clear(): void {
    this.sent = []
  }
}
