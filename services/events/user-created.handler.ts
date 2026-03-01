import type { EventBridgeHandler } from 'aws-lambda'
import type { UserCreatedEvent } from '@ripple-next/events'

/**
 * EventBridge handler for UserCreated events.
 * Triggered when a new user is created.
 */
export const handler: EventBridgeHandler<'UserCreated', UserCreatedEvent['data'], void> = async (
  event
) => {
  const { userId, email, name } = event.detail

  console.log(`User created: ${name} (${email})`, { userId })

  // Send welcome email
  // Set up default user preferences
  // Notify admin channel
}
