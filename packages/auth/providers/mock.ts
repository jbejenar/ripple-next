import type { AuthProvider, AuthUser, Session } from '../types'

/**
 * Mock auth provider for tests.
 * Always authenticates — no real credential checking.
 */
export class MockAuthProvider implements AuthProvider {
  private sessions = new Map<string, Session>()
  private defaultUser: AuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  }

  constructor(defaultUser?: Partial<AuthUser>) {
    if (defaultUser) {
      this.defaultUser = { ...this.defaultUser, ...defaultUser }
    }
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) ?? null
  }

  async createSession(userId: string): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      user: { ...this.defaultUser, id: userId },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
    this.sessions.set(session.id, session)
    return session
  }

  async invalidateSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  async validateCredentials(_email: string, _password: string): Promise<AuthUser | null> {
    return this.defaultUser
  }

  async getAuthorizationUrl(state: string, _codeVerifier: string): Promise<URL> {
    return new URL(`https://mock-idp.test/authorize?state=${state}`)
  }

  async handleCallback(_code: string, _codeVerifier: string): Promise<AuthUser> {
    return this.defaultUser
  }

  // Test helper
  clear(): void {
    this.sessions.clear()
  }
}
