import type { AuthProvider, AuthUser, Session } from '../types'

/**
 * AWS Cognito auth provider for production.
 */
export class CognitoAuthProvider implements AuthProvider {
  async validateSession(sessionId: string): Promise<Session | null> {
    void sessionId
    throw new Error('CognitoAuthProvider: Not yet implemented')
  }

  async createSession(userId: string): Promise<Session> {
    void userId
    throw new Error('CognitoAuthProvider: Not yet implemented')
  }

  async invalidateSession(sessionId: string): Promise<void> {
    void sessionId
    throw new Error('CognitoAuthProvider: Not yet implemented')
  }

  async validateCredentials(email: string, password: string): Promise<AuthUser | null> {
    void email
    void password
    throw new Error('CognitoAuthProvider: Not yet implemented')
  }
}
