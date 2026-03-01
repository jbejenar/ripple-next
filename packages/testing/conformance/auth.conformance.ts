/**
 * Auth Provider Conformance Suite
 *
 * Every AuthProvider implementation must pass these tests.
 *
 * @example
 * ```ts
 * import { authConformance } from '@ripple-next/testing/conformance/auth.conformance'
 * import { MockAuthProvider } from '@ripple-next/auth'
 *
 * authConformance({
 *   name: 'MockAuthProvider',
 *   factory: () => new MockAuthProvider(),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { AuthProvider } from '@ripple-next/auth'

interface AuthConformanceOptions {
  name: string
  factory: () => AuthProvider
  cleanup?: () => Promise<void>
}

export function authConformance({ name, factory, cleanup }: AuthConformanceOptions): void {
  describe(`AuthProvider conformance: ${name}`, () => {
    let provider: AuthProvider

    beforeEach(() => {
      provider = factory()
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('createSession() returns a valid session', async () => {
      const session = await provider.createSession('user-123')

      expect(session.id).toBeTruthy()
      expect(typeof session.id).toBe('string')
      expect(session.userId).toBe('user-123')
      expect(session.user).toBeDefined()
      expect(session.user.id).toBe('user-123')
      expect(session.expiresAt).toBeInstanceOf(Date)
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('validateSession() returns session for valid id', async () => {
      const created = await provider.createSession('user-456')
      const validated = await provider.validateSession(created.id)

      expect(validated).not.toBeNull()
      expect(validated!.id).toBe(created.id)
      expect(validated!.userId).toBe('user-456')
    })

    it('validateSession() returns null for invalid id', async () => {
      const result = await provider.validateSession('nonexistent-session-id')
      expect(result).toBeNull()
    })

    it('invalidateSession() makes session unvalidatable', async () => {
      const session = await provider.createSession('user-789')
      await provider.invalidateSession(session.id)

      const result = await provider.validateSession(session.id)
      expect(result).toBeNull()
    })

    it('getAuthorizationUrl() returns a URL', async () => {
      const url = await provider.getAuthorizationUrl('test-state', 'test-verifier')
      expect(url).toBeInstanceOf(URL)
      expect(url.toString()).toContain('test-state')
    })

    it('createSession() generates unique session ids', async () => {
      const a = await provider.createSession('user-a')
      const b = await provider.createSession('user-b')
      expect(a.id).not.toBe(b.id)
    })
  })
}
