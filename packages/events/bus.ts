import type { DomainEvent, EventBus, EventHandler } from './types'

/**
 * In-memory event bus for tests and local development.
 */
export class MemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>()
  public published: DomainEvent[] = []

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event)
    const eventHandlers = this.handlers.get(event.type) ?? []
    await Promise.all(eventHandlers.map((handler) => handler(event)))
  }

  subscribe<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    existing.push(handler as EventHandler)
    this.handlers.set(eventType, existing)
  }

  clear(): void {
    this.published = []
    this.handlers.clear()
  }
}

/**
 * AWS EventBridge event bus for production.
 */
export class EventBridgeBus implements EventBus {
  private busName: string

  constructor(busName: string) {
    this.busName = busName
  }

  async publish(event: DomainEvent): Promise<void> {
    const { EventBridgeClient, PutEventsCommand } = await import(
      '@aws-sdk/client-eventbridge'
    )
    const client = new EventBridgeClient({ region: 'ap-southeast-2' })
    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: this.busName,
            Source: event.source,
            DetailType: event.type,
            Detail: JSON.stringify(event.data)
          }
        ]
      })
    )
  }

  subscribe<T extends DomainEvent>(_eventType: T['type'], _handler: EventHandler<T>): void {
    // EventBridge subscriptions are configured in SST, not in code
    throw new Error('EventBridge subscriptions are managed via SST config, not runtime code')
  }
}
