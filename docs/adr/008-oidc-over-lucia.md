# ADR-008: Replace Lucia Auth with Standard OIDC/OAuth

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** Lucia Auth v3 was deprecated in early 2025. The codebase depended on `lucia@^3.2.2` but never implemented the provider beyond stubs.

## Context

The auth package (`@ripple/auth`) defined three providers following the project's provider pattern:

- **MockAuthProvider** — fully implemented for testing
- **LuciaAuthProvider** — stub (all methods throw "Not yet implemented")
- **CognitoAuthProvider** — stub (all methods throw "Not yet implemented")

Lucia Auth v3 was officially deprecated by its maintainer, who concluded that the database adapter model was too limiting and recommended implementing sessions directly. The npm package is no longer maintained.

## Decision

Replace Lucia with a **provider-agnostic OIDC/OAuth implementation** using `oauth4webapi`.

## Rationale

### Why `oauth4webapi`

- Certified OIDC Relying Party library by Filip Skokan (OIDC spec contributor, author of `jose` and `node-oidc-provider`)
- Zero dependencies, works in any runtime (Lambda, Edge, Node)
- Implements RFC 6749, RFC 7636 (PKCE), OpenID Connect Core, and OIDC Discovery
- Provider-agnostic: works with any OIDC-compliant issuer (Cognito, Keycloak, Auth0, etc.)

### Alternatives Considered

| Option                     | Why not                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Better Auth**            | Opinionated full framework — more than needed when we already have the provider pattern                             |
| **Arctic**                 | Provider-specific (named classes per OAuth provider). We want one configurable OIDC endpoint, not per-provider code |
| **@sidebase/nuxt-auth**    | Wraps Auth.js/NextAuth. Adds framework lock-in. Our tRPC + provider pattern already handles the wiring              |
| **Roll our own with Oslo** | More code to maintain. `oauth4webapi` does the same thing with spec compliance baked in                             |

### Why not keep Cognito as a separate provider

Cognito supports standard OIDC. The `OidcAuthProvider` can point at Cognito's OIDC endpoints via configuration. A separate `CognitoAuthProvider` would duplicate OIDC logic.

## Consequences

- `LuciaAuthProvider` and `CognitoAuthProvider` stubs deleted
- `lucia` npm dependency removed, `oauth4webapi` added
- New `OidcAuthProvider` handles any OIDC-compliant identity provider
- `sessions` table added to database schema for server-side session storage
- `users.oidc_sub` column maps OIDC subject identifiers to local users
- Nuxt server routes handle OIDC Authorization Code Flow with PKCE
- Login page changes from email/password form to SSO redirect button
- Keycloak added to Docker Compose for local OIDC development
- MockAuthProvider unchanged — all existing tests continue to pass

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — the pattern this follows
- [Architecture](../architecture.md) — system overview
- [Provider Pattern Guide](../provider-pattern.md) — implementation details
