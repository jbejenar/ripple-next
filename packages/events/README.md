# @ripple-next/events

Domain event bus for typed async event handling.

## Install

```bash
pnpm add @ripple-next/events
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `MemoryEventBus` | Tests, local dev | In-memory pub/sub |
| `EventBridgeBus` | Production | AWS EventBridge |

## Interface

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): void
}
```

## Domain Events

```typescript
type DomainEvent =
  | UserCreatedEvent       // { type: 'user.created', source: 'app.users', ... }
  | UserUpdatedEvent       // { type: 'user.updated', source: 'app.users', ... }
  | ProjectCreatedEvent    // { type: 'project.created', source: 'app.projects', ... }
  | ProjectPublishedEvent  // { type: 'project.published', source: 'app.projects', ... }
```

## Usage

```typescript
import { MemoryEventBus } from '@ripple-next/events'

const bus = new MemoryEventBus()

bus.subscribe('user.created', async (event) => {
  console.log(`New user: ${event.data.email}`)
})

await bus.publish({
  type: 'user.created',
  source: 'app.users',
  data: { id: '1', email: 'user@example.com', name: 'Jane' },
})
```

## Conformance Testing

```typescript
import { eventBusConformance } from '@ripple-next/testing/conformance'

eventBusConformance(MyCustomEventBus)
```

## Related

- [Provider pattern](../../docs/provider-pattern.md)
