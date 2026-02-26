export interface EmailMessage {
  to: string | string[]
  from?: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface SentEmail extends EmailMessage {
  id: string
  sentAt: Date
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<SentEmail>
}
