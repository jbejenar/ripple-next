import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as oauth from 'oauth4webapi'
import { OidcAuthProvider } from '../providers/oidc'
import type { SessionStore, UserStore } from '../providers/oidc'
import type { Session, AuthUser } from '../types'
import { isDockerAvailable } from '@ripple/testing/helpers/db'
import {
  setupTestKeycloak,
  simulateAuthCodeFlow,
  type TestKeycloak
} from '@ripple/testing/helpers/keycloak'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REALM_FILE = resolve(__dirname, 'fixtures/ripple-test-realm.json')
const dockerAvailable = isDockerAvailable()

const TEST_CLIENT = {
  clientId: 'ripple-test-client',
  clientSecret: 'test-secret',
  redirectUri: 'http://localhost:9999/callback',
}

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword',
  email: 'test@example.com',
}

/**
 * In-memory session store for integration tests.
 * Tests the OidcAuthProvider's session delegation, not the store itself.
 */
class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>()

  async create(userId: string): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      user: { id: userId, email: '', name: '', role: 'user' },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
    this.sessions.set(session.id, session)
    return session
  }

  async validate(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) ?? null
  }

  async invalidate(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }
}

/**
 * In-memory user store for integration tests.
 * Tracks users created via OIDC sub linking.
 */
class InMemoryUserStore implements UserStore {
  readonly users = new Map<string, AuthUser>()

  async findOrCreateByOidcSub(sub: string, email: string, name: string): Promise<AuthUser> {
    const existing = this.users.get(sub)
    if (existing) return existing

    const user: AuthUser = { id: sub, email, name, role: 'user' }
    this.users.set(sub, user)
    return user
  }
}

describe.runIf(dockerAvailable)('OidcAuthProvider (Keycloak Integration)', () => {
  let keycloak: TestKeycloak
  let provider: OidcAuthProvider
  let sessionStore: InMemorySessionStore
  let userStore: InMemoryUserStore

  beforeAll(async () => {
    keycloak = await setupTestKeycloak({
      realmImportPath: REALM_FILE,
      realmName: 'ripple-test',
    })

    sessionStore = new InMemorySessionStore()
    userStore = new InMemoryUserStore()

    provider = new OidcAuthProvider(
      {
        issuerUrl: keycloak.issuerUrl,
        clientId: TEST_CLIENT.clientId,
        clientSecret: TEST_CLIENT.clientSecret,
        redirectUri: TEST_CLIENT.redirectUri,
      },
      sessionStore,
      userStore
    )
  }, 120_000)

  afterAll(async () => {
    await keycloak?.cleanup()
  }, 30_000)

  describe('OIDC Discovery', () => {
    it('generates a valid authorization URL from discovered endpoints', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const url = await provider.getAuthorizationUrl('discovery-test', verifier)

      expect(url).toBeInstanceOf(URL)
      expect(url.searchParams.get('client_id')).toBe(TEST_CLIENT.clientId)
      expect(url.searchParams.get('redirect_uri')).toBe(TEST_CLIENT.redirectUri)
      expect(url.searchParams.get('response_type')).toBe('code')
      expect(url.searchParams.get('scope')).toContain('openid')
      expect(url.searchParams.get('state')).toBe('discovery-test')
      expect(url.searchParams.get('code_challenge')).toBeTruthy()
      expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    })
  })

  describe('Authorization Code + PKCE Exchange', () => {
    it('completes the full OIDC flow and returns a user', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const state = crypto.randomUUID()
      const authUrl = await provider.getAuthorizationUrl(state, verifier)

      const { code, state: returnedState } = await simulateAuthCodeFlow({
        authorizationUrl: authUrl,
        username: TEST_USER.username,
        password: TEST_USER.password,
      })

      expect(returnedState).toBe(state)
      expect(code).toBeTruthy()

      const user = await provider.handleCallback(code, verifier)

      expect(user).toBeDefined()
      expect(user.email).toBe(TEST_USER.email)
      expect(user.name).toBeTruthy()
      expect(user.id).toBeTruthy()
    })

    it('links OIDC sub to user on callback', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const authUrl = await provider.getAuthorizationUrl('link-test', verifier)

      const { code } = await simulateAuthCodeFlow({
        authorizationUrl: authUrl,
        username: TEST_USER.username,
        password: TEST_USER.password,
      })

      const user = await provider.handleCallback(code, verifier)

      // User should be stored by OIDC sub
      expect(userStore.users.has(user.id)).toBe(true)
      const stored = userStore.users.get(user.id)!
      expect(stored.email).toBe(TEST_USER.email)
    })
  })

  describe('Session Lifecycle', () => {
    it('creates and validates a session after OIDC auth', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const authUrl = await provider.getAuthorizationUrl('session-create', verifier)

      const { code } = await simulateAuthCodeFlow({
        authorizationUrl: authUrl,
        username: TEST_USER.username,
        password: TEST_USER.password,
      })

      const user = await provider.handleCallback(code, verifier)
      const session = await provider.createSession(user.id)

      expect(session.userId).toBe(user.id)
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now())

      const validated = await provider.validateSession(session.id)
      expect(validated).not.toBeNull()
      expect(validated!.userId).toBe(user.id)
    })

    it('invalidates a session (logout)', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const authUrl = await provider.getAuthorizationUrl('logout-test', verifier)

      const { code } = await simulateAuthCodeFlow({
        authorizationUrl: authUrl,
        username: TEST_USER.username,
        password: TEST_USER.password,
      })

      const user = await provider.handleCallback(code, verifier)
      const session = await provider.createSession(user.id)

      await provider.invalidateSession(session.id)

      const validated = await provider.validateSession(session.id)
      expect(validated).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('rejects invalid authorization code', async () => {
      const verifier = oauth.generateRandomCodeVerifier()

      await expect(
        provider.handleCallback('invalid-code', verifier)
      ).rejects.toThrow()
    })

    it('rejects mismatched PKCE verifier', async () => {
      const verifier = oauth.generateRandomCodeVerifier()
      const wrongVerifier = oauth.generateRandomCodeVerifier()
      const authUrl = await provider.getAuthorizationUrl('wrong-verifier', verifier)

      const { code } = await simulateAuthCodeFlow({
        authorizationUrl: authUrl,
        username: TEST_USER.username,
        password: TEST_USER.password,
      })

      await expect(
        provider.handleCallback(code, wrongVerifier)
      ).rejects.toThrow()
    })

    it('rejects password authentication', async () => {
      await expect(
        provider.validateCredentials(TEST_USER.email, TEST_USER.password)
      ).rejects.toThrow('OidcAuthProvider does not support password authentication')
    })
  })
})
