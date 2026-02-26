import type { AuthProvider, AuthUser, Session } from '../types'

/**
 * Lucia Auth provider — TypeScript-native, adapter-based auth.
 * Uses database adapter for session storage.
 */
export class LuciaAuthProvider implements AuthProvider {
  async validateSession(sessionId: string): Promise<Session | null> {
    // Lucia session validation will be implemented with DB adapter
    void sessionId
    return null
  }

  async createSession(userId: string): Promise<Session> {
    // Lucia session creation
    void userId
    throw new Error('LuciaAuthProvider: Not yet implemented — configure Lucia adapter')
  }

  async invalidateSession(sessionId: string): Promise<void> {
    // Lucia session invalidation
    void sessionId
    throw new Error('LuciaAuthProvider: Not yet implemented — configure Lucia adapter')
  }

  async validateCredentials(email: string, password: string): Promise<AuthUser | null> {
    // Credential validation with password hashing
    void email
    void password
    throw new Error('LuciaAuthProvider: Not yet implemented — configure Lucia adapter')
  }
}
