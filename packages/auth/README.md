# @ripple-next/auth

Authentication provider abstraction with OIDC/OAuth2 support (Authorization Code + PKCE).

## Install

```bash
pnpm add @ripple-next/auth
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `MockAuthProvider` | Tests, local dev | In-memory |
| `OidcAuthProvider` | Production, staging | Any OIDC issuer via `oauth4webapi` |

## Interface

```typescript
interface AuthProvider {
  getAuthorizationUrl(state: string, codeVerifier: string): Promise<URL>
  handleCallback(params: URLSearchParams, expectedState: string, codeVerifier: string): Promise<AuthUser>
  validateSession(sessionId: string): Promise<Session | null>
  createSession(userId: string): Promise<Session>
  invalidateSession(sessionId: string): Promise<void>
  validateCredentials(email: string, password: string): Promise<AuthUser | null>
}
```

## Usage

```typescript
import { OidcAuthProvider, MockAuthProvider } from '@ripple-next/auth'

// Production — configure with your OIDC issuer
const auth = new OidcAuthProvider({
  issuerUrl: 'https://your-idp.example.com/realms/app',
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.example.com/auth/callback',
  userStore: yourUserStore,
  sessionStore: yourSessionStore,
})

// Tests — in-memory, no network
const auth = new MockAuthProvider()
```

## RBAC Utilities

```typescript
import { hasPermission, hasAnyPermission, getRolePermissions } from '@ripple-next/auth'

hasPermission(user, 'content:publish') // boolean
```

## Conformance Testing

Validate custom providers against the contract:

```typescript
import { authConformance } from '@ripple-next/testing/conformance'

authConformance(MyCustomAuthProvider)
```

## Related

- [ADR-008: OIDC over Lucia](../../docs/adr/008-oidc-over-lucia.md)
- [Provider pattern](../../docs/provider-pattern.md)
