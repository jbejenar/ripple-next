import type { EventBridgeHandler } from 'aws-lambda'
import type { UserCreatedEvent } from '@ripple-next/events'

/**
 * EventBridge handler for UserCreated events.
 * Triggered when a new user is created.
 */
// TODO(RN-080): Implement handler — see docs/product-roadmap/README.md
export const handler: EventBridgeHandler<'UserCreated', UserCreatedEvent['data'], void> = async (
  event
) => {
  const { userId, email, name } = event.detail

  console.log(`User created: ${name} (${email})`, { userId })

  // Send welcome email
  // Set up default user preferences
  // Notify admin channel
}
