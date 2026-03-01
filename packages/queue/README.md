# @ripple-next/queue

Message queue provider abstraction for async job processing with typed messages and DLQ support.

## Install

```bash
pnpm add @ripple-next/queue
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `MemoryQueueProvider` | Tests | In-memory FIFO |
| `BullMQQueueProvider` | Local dev | Redis (BullMQ) |
| `SqsQueueProvider` | Production | AWS SQS |

## Interface

```typescript
interface QueueProvider {
  send<T>(queue: string, message: T, options?: SendOptions): Promise<string>
  receive<T>(queue: string, options?: ReceiveOptions): Promise<QueueMessage<T>[]>
  delete(queue: string, messageId: string): Promise<void>
  purge(queue: string): Promise<void>
}
```

## Queue Events

```typescript
type QueueEvent =
  | SendEmailEvent       // { type: 'send-email', ... }
  | ProcessImageEvent    // { type: 'process-image', ... }
  | NotifyEvent          // { type: 'notify', ... }
```

## Usage

```typescript
import { SqsQueueProvider, MemoryQueueProvider } from '@ripple-next/queue'

const queue = new SqsQueueProvider({ region: 'ap-southeast-2' })

// Send
await queue.send('email-queue', { type: 'send-email', to: 'user@example.com' })

// Consume with helper
import { consumeMessages } from '@ripple-next/queue'

await consumeMessages(queue, 'email-queue', async (message) => {
  // Process message
})
```

## Conformance Testing

```typescript
import { queueConformance } from '@ripple-next/testing/conformance'

queueConformance(MyCustomQueueProvider)
```

## Related

- [Provider pattern](../../docs/provider-pattern.md)
