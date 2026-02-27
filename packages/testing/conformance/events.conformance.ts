/**
 * EventBus Conformance Suite
 *
 * Every EventBus implementation must pass these tests.
 *
 * @example
 * ```ts
 * import { eventBusConformance } from '@ripple/testing/conformance/events.conformance'
 * import { MemoryEventBus } from '@ripple/events'
 *
 * eventBusConformance({
 *   name: 'MemoryEventBus',
 *   factory: () => new MemoryEventBus(),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { EventBus, DomainEvent, UserCreatedEvent } from '@ripple/events'

interface EventBusConformanceOptions {
  name: string
  factory: () => EventBus
  cleanup?: () => Promise<void>
  /** Set to true if the implementation doesn't support runtime subscribe (e.g. EventBridge) */
  skipSubscribe?: boolean
}

export function eventBusConformance({
  name,
  factory,
  cleanup,
  skipSubscribe
}: EventBusConformanceOptions): void {
  describe(`EventBus conformance: ${name}`, () => {
    let bus: EventBus

    const sampleEvent: UserCreatedEvent = {
      type: 'UserCreated',
      source: 'app.users',
      data: {
        userId: 'u-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    }

    beforeEach(() => {
      bus = factory()
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('publish() completes without error', async () => {
      await expect(bus.publish(sampleEvent)).resolves.toBeUndefined()
    })

    it('publish() accepts all domain event types', async () => {
      const events: DomainEvent[] = [
        sampleEvent,
        {
          type: 'UserUpdated',
          source: 'app.users',
          data: { userId: 'u-1', changes: { name: 'New Name' }, updatedAt: new Date().toISOString() }
        },
        {
          type: 'ProjectCreated',
          source: 'app.projects',
          data: {
            projectId: 'p-1',
            name: 'Test',
            slug: 'test',
            ownerId: 'u-1',
            createdAt: new Date().toISOString()
          }
        }
      ]

      for (const event of events) {
        await expect(bus.publish(event)).resolves.toBeUndefined()
      }
    })

    if (!skipSubscribe) {
      it('subscribe() receives published events', async () => {
        const received: DomainEvent[] = []
        bus.subscribe('UserCreated', async (event) => {
          received.push(event)
        })

        await bus.publish(sampleEvent)

        expect(received).toHaveLength(1)
        expect(received[0].type).toBe('UserCreated')
      })

      it('subscribe() only receives matching event types', async () => {
        const received: DomainEvent[] = []
        bus.subscribe('ProjectCreated', async (event) => {
          received.push(event)
        })

        await bus.publish(sampleEvent) // UserCreated — should NOT trigger

        expect(received).toHaveLength(0)
      })

      it('multiple subscribers receive the same event', async () => {
        let count = 0
        bus.subscribe('UserCreated', async () => {
          count++
        })
        bus.subscribe('UserCreated', async () => {
          count++
        })

        await bus.publish(sampleEvent)
        expect(count).toBe(2)
      })
    }
  })
}
