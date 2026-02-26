import type { SQSEvent, SQSHandler } from 'aws-lambda'
import type { SendEmailEvent } from '@ripple/queue'
import type { EmailProvider } from '@ripple/email'

interface EmailHandlerDeps {
  emailProvider: EmailProvider
}

/**
 * Lambda handler for processing email queue messages.
 * Triggered by SQS events.
 */
export function createEmailHandler(deps: EmailHandlerDeps): SQSHandler {
  return async (event: SQSEvent) => {
    for (const record of event.Records) {
      const message: SendEmailEvent = JSON.parse(record.body)

      await deps.emailProvider.send({
        to: message.to,
        subject: `Notification: ${message.template}`,
        html: `<p>Template: ${message.template}</p><pre>${JSON.stringify(message.data, null, 2)}</pre>`
      })
    }
  }
}

// Default export for SST Lambda handler
export const handler: SQSHandler = async (event) => {
  // In production, instantiate real providers via SST Resource
  const { SesEmailProvider } = await import('@ripple/email')
  const emailProvider = new SesEmailProvider('noreply@ripple.dev')

  const emailHandler = createEmailHandler({ emailProvider })
  return emailHandler(event, {} as never, () => {})
}
