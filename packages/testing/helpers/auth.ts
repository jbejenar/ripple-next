import { MockAuthProvider, type AuthUser } from '@ripple/auth'

/**
 * Create a pre-authenticated mock auth provider.
 */
export function createMockAuth(user?: Partial<AuthUser>): MockAuthProvider {
  return new MockAuthProvider(user)
}

/**
 * Create a mock session for testing.
 */
export async function createMockSession(
  auth: MockAuthProvider,
  userId?: string
): Promise<{ sessionId: string; userId: string }> {
  const id = userId ?? 'test-user-id'
  const session = await auth.createSession(id)
  return { sessionId: session.id, userId: id }
}
