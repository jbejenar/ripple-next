import * as oauth from 'oauth4webapi'
import type { AuthProvider, AuthUser, Session, OidcConfig } from '../types'

export interface SessionStore {
  create(userId: string): Promise<Session>
  validate(sessionId: string): Promise<Session | null>
  invalidate(sessionId: string): Promise<void>
}

export interface UserStore {
  findOrCreateByOidcSub(sub: string, email: string, name: string): Promise<AuthUser>
}

/**
 * Provider-agnostic OIDC auth provider.
 * Works with any OIDC-compliant identity provider (Cognito, Keycloak, Auth0, etc.)
 * Uses oauth4webapi for Authorization Code Flow with PKCE.
 */
export class OidcAuthProvider implements AuthProvider {
  private authServer: oauth.AuthorizationServer | null = null
  private client: oauth.Client
  private clientAuth: oauth.ClientAuth

  constructor(
    private config: OidcConfig,
    private sessionStore: SessionStore,
    private userStore: UserStore
  ) {
    this.client = { client_id: config.clientId }
    this.clientAuth = oauth.ClientSecretBasic(config.clientSecret)
  }

  private get httpOptions() {
    return this.config.allowHttpRequests
      ? { [oauth.allowInsecureRequests]: true }
      : {}
  }

  private async getAuthServer(): Promise<oauth.AuthorizationServer> {
    if (!this.authServer) {
      const issuer = new URL(this.config.issuerUrl)
      const response = await oauth.discoveryRequest(issuer, this.httpOptions)
      this.authServer = await oauth.processDiscoveryResponse(issuer, response)
    }
    return this.authServer
  }

  async getAuthorizationUrl(state: string, codeVerifier: string): Promise<URL> {
    const as = await this.getAuthServer()
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier)

    const params = new URLSearchParams()
    params.set('client_id', this.config.clientId)
    params.set('redirect_uri', this.config.redirectUri)
    params.set('response_type', 'code')
    params.set('scope', (this.config.scopes ?? ['openid', 'email', 'profile']).join(' '))
    params.set('state', state)
    params.set('code_challenge', codeChallenge)
    params.set('code_challenge_method', 'S256')

    const url = new URL(as.authorization_endpoint!)
    url.search = params.toString()
    return url
  }

  async handleCallback(code: string, codeVerifier: string): Promise<AuthUser> {
    const as = await this.getAuthServer()

    const callbackParams = new URLSearchParams()
    callbackParams.set('code', code)

    const response = await oauth.authorizationCodeGrantRequest(
      as,
      this.client,
      this.clientAuth,
      callbackParams,
      this.config.redirectUri,
      codeVerifier,
      this.httpOptions
    )

    // processAuthorizationCodeResponse throws ResponseBodyError on OAuth2 errors
    const result = await oauth.processAuthorizationCodeResponse(as, this.client, response)

    const claims = oauth.getValidatedIdTokenClaims(result)
    if (!claims) {
      throw new Error('OIDC: No ID token claims in response')
    }

    const sub = claims.sub
    const email = (claims.email as string) ?? ''
    const name = (claims.name as string) ?? email

    return this.userStore.findOrCreateByOidcSub(sub, email, name)
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    return this.sessionStore.validate(sessionId)
  }

  async createSession(userId: string): Promise<Session> {
    return this.sessionStore.create(userId)
  }

  async invalidateSession(sessionId: string): Promise<void> {
    return this.sessionStore.invalidate(sessionId)
  }

  async validateCredentials(_email: string, _password: string): Promise<AuthUser | null> {
    throw new Error('OidcAuthProvider does not support password authentication. Use OIDC flow.')
  }
}
