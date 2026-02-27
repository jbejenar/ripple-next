/**
 * Email Provider Conformance Suite
 *
 * Every EmailProvider implementation must pass these tests.
 *
 * @example
 * ```ts
 * import { emailConformance } from '@ripple/testing/conformance/email.conformance'
 * import { MemoryEmailProvider } from '@ripple/email'
 *
 * emailConformance({
 *   name: 'MemoryEmailProvider',
 *   factory: () => new MemoryEmailProvider(),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { EmailProvider, EmailMessage } from '@ripple/email'

interface EmailConformanceOptions {
  name: string
  factory: () => EmailProvider
  cleanup?: () => Promise<void>
}

export function emailConformance({ name, factory, cleanup }: EmailConformanceOptions): void {
  describe(`EmailProvider conformance: ${name}`, () => {
    let provider: EmailProvider

    beforeEach(() => {
      provider = factory()
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('send() returns a SentEmail with id and sentAt', async () => {
      const message: EmailMessage = {
        to: 'user@example.com',
        subject: 'Conformance test',
        html: '<p>Hello</p>'
      }

      const result = await provider.send(message)

      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
      expect(result.sentAt).toBeInstanceOf(Date)
      expect(result.to).toBe('user@example.com')
      expect(result.subject).toBe('Conformance test')
      expect(result.html).toBe('<p>Hello</p>')
    })

    it('send() handles array of recipients', async () => {
      const message: EmailMessage = {
        to: ['a@example.com', 'b@example.com'],
        subject: 'Multi-recipient',
        html: '<p>Hi all</p>'
      }

      const result = await provider.send(message)
      expect(result.id).toBeTruthy()
      expect(result.to).toEqual(['a@example.com', 'b@example.com'])
    })

    it('send() preserves optional fields', async () => {
      const message: EmailMessage = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'With extras',
        html: '<p>Body</p>',
        text: 'Body',
        replyTo: 'reply@example.com'
      }

      const result = await provider.send(message)
      expect(result.from).toBe('sender@example.com')
      expect(result.text).toBe('Body')
      expect(result.replyTo).toBe('reply@example.com')
    })

    it('send() generates unique ids for each email', async () => {
      const message: EmailMessage = {
        to: 'user@example.com',
        subject: 'Unique check',
        html: '<p>Test</p>'
      }

      const [a, b] = await Promise.all([provider.send(message), provider.send(message)])
      expect(a.id).not.toBe(b.id)
    })
  })
}
