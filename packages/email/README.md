# @ripple-next/email

Email delivery provider abstraction.

## Install

```bash
pnpm add @ripple-next/email
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `MemoryEmailProvider` | Tests | In-memory (stores sent emails) |
| `SmtpEmailProvider` | Local dev | SMTP (nodemailer) — works with Mailpit |
| `SesEmailProvider` | Production | AWS SES |

## Interface

```typescript
interface EmailProvider {
  send(message: EmailMessage): Promise<SentEmail>
}

interface EmailMessage {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
}
```

## Usage

```typescript
import { SesEmailProvider, MemoryEmailProvider } from '@ripple-next/email'

// Production
const email = new SesEmailProvider({ region: 'ap-southeast-2' })

// Tests — inspect sent messages
const email = new MemoryEmailProvider()
await email.send({ to: 'user@example.com', subject: 'Hello', text: 'World' })
console.log(email.sent) // [{ to: 'user@example.com', ... }]
```

## Conformance Testing

```typescript
import { emailConformance } from '@ripple-next/testing/conformance'

emailConformance(MyCustomEmailProvider)
```

## Related

- [Provider pattern](../../docs/provider-pattern.md)
