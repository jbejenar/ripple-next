export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface Session {
  id: string
  userId: string
  user: AuthUser
  expiresAt: Date
}

export interface OidcConfig {
  issuerUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes?: string[]
}

export interface AuthProvider {
  validateSession(sessionId: string): Promise<Session | null>
  createSession(userId: string): Promise<Session>
  invalidateSession(sessionId: string): Promise<void>
  validateCredentials(email: string, password: string): Promise<AuthUser | null>
  getAuthorizationUrl(state: string, codeVerifier: string): Promise<URL>
  handleCallback(code: string, codeVerifier: string): Promise<AuthUser>
}

export type Permission = 'read' | 'write' | 'admin'
export type Role = 'user' | 'editor' | 'admin'

export interface RolePermissions {
  role: Role
  permissions: Permission[]
}
