import { describe, it, expect, beforeEach } from 'vitest'
import { MockAuthProvider } from '../providers/mock'

describe('MockAuthProvider', () => {
  let auth: MockAuthProvider

  beforeEach(() => {
    auth = new MockAuthProvider()
  })

  it('creates and validates a session', async () => {
    const session = await auth.createSession('user-123')
    expect(session.userId).toBe('user-123')
    expect(session.user.id).toBe('user-123')

    const validated = await auth.validateSession(session.id)
    expect(validated).not.toBeNull()
    expect(validated?.userId).toBe('user-123')
  })

  it('returns null for invalid session', async () => {
    const session = await auth.validateSession('nonexistent')
    expect(session).toBeNull()
  })

  it('invalidates a session', async () => {
    const session = await auth.createSession('user-123')
    await auth.invalidateSession(session.id)
    const validated = await auth.validateSession(session.id)
    expect(validated).toBeNull()
  })

  it('always validates credentials', async () => {
    const user = await auth.validateCredentials('any@email.com', 'any-password')
    expect(user).not.toBeNull()
    expect(user?.email).toBe('test@example.com')
  })

  it('accepts custom default user', async () => {
    const customAuth = new MockAuthProvider({ role: 'editor', name: 'Custom User' })
    const user = await customAuth.validateCredentials('any@email.com', 'pass')
    expect(user?.role).toBe('editor')
    expect(user?.name).toBe('Custom User')
  })
})
