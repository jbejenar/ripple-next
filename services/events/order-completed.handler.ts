import type { EventBridgeHandler } from 'aws-lambda'

interface OrderCompletedDetail {
  orderId: string
  userId: string
  total: number
  completedAt: string
}

/**
 * EventBridge handler for OrderCompleted events.
 */
export const handler: EventBridgeHandler<
  'OrderCompleted',
  OrderCompletedDetail,
  void
> = async (event) => {
  const { orderId, userId, total } = event.detail

  console.log(`Order completed: ${orderId} by user ${userId}, total: ${total}`)

  // Send confirmation email
  // Update analytics
  // Trigger fulfillment
}
