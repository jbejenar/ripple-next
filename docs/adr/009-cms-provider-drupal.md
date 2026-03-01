# ADR-009: CMS Provider Pattern for Drupal/Tide Integration

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** The original Ripple design system is tightly coupled to Drupal/Tide. Ripple Next needs a CMS content layer that maintains compatibility with Tide while remaining CMS-agnostic.

## Context

The original [Ripple](https://github.com/dpc-sdp/ripple) is a Nuxt 2 design system
built for the Victorian government's Drupal/Tide distribution. It directly integrates
with Drupal's JSON:API, making Drupal a hard dependency for all development and testing.

Ripple Next needs to:

1. Support Drupal/Tide for government sites that already use it
2. Remain CMS-agnostic so new deployments aren't locked to Drupal
3. Enable fast test loops without requiring a running Drupal instance
4. Follow the existing provider pattern used for auth, queue, storage, email, and events

## Decision

Create `@ripple-next/cms` following the **provider pattern** with:

- **`CmsProvider` interface** (`packages/cms/types.ts`) defining operations for pages, taxonomies, menus, routes, and search
- **`MockCmsProvider`** (`packages/cms/providers/mock.ts`) — in-memory implementation for tests and local dev
- **`DrupalCmsProvider`** (`packages/cms/providers/drupal.ts`) — JSON:API client for Drupal/Tide
- **Conformance test suite** (`packages/testing/conformance/cms.conformance.ts`) — validates any CMS provider

## Rationale

### Why provider pattern (not direct Drupal integration)

The original Ripple's tight coupling to Drupal means:

- Every test requires a running Drupal instance or complex mocking
- Switching CMS backends requires rewriting frontend code
- Agent workflows are slow due to Drupal startup/teardown

The provider pattern eliminates these issues while keeping full Drupal compatibility
when configured.

### Why native `fetch` (not Axios)

The original Ripple uses Axios for HTTP requests. We chose native `globalThis.fetch` because:

- Zero dependencies — works in Node, Lambda, Edge, and browser runtimes
- Standard API — no library-specific abstractions to learn
- Better tree-shaking in serverless environments

### Why Tide-aligned content model

The `CmsPage` type uses Tide content types (page, landing_page, news, event) and
section types (accordion, card-collection, timeline, etc.) to maintain compatibility
with existing Drupal/Tide content. This avoids requiring content migration for
government sites moving from original Ripple to Ripple Next.

### Why Zod schemas for CMS types

CMS content is validated at the API boundary using Zod schemas in
`packages/validation/schemas/cms.ts`. This ensures:

- Runtime validation of CMS responses (Drupal JSON:API can return unexpected shapes)
- Shared type definitions between frontend and backend
- Consistent with validation approach used across all other packages

### Alternatives Considered

| Option | Why not |
|--------|---------|
| **Direct Drupal SDK** | Locks the platform to Drupal; doesn't follow provider pattern; breaks test isolation |
| **GraphQL CMS layer** | Adds complexity; Drupal's JSON:API is already RESTful; GraphQL layer would need its own provider |
| **Headless CMS SaaS** (Contentful, Strapi) | Government sites use Tide/Drupal; can't replace their CMS; but provider pattern allows adding SaaS providers later |
| **Database-backed CMS** | Would duplicate Drupal's content management; government content editors already use Drupal admin |

## Consequences

- `@ripple-next/cms` package created with `CmsProvider` interface
- `MockCmsProvider` enables CMS-dependent tests to run without Drupal (<100ms)
- `DrupalCmsProvider` connects to Drupal/Tide via JSON:API with basic auth support
- 28 Zod schemas added to `@ripple-next/validation` for CMS content types
- 18 conformance tests validate any CMS provider implementation
- 6 Nuxt API routes under `/api/cms/` proxy to the configured provider
- `useCms()` composable provides frontend access to CMS data
- 8 Tide-compatible UI components render content sections
- Dynamic page route at `/content/[...slug].vue` renders CMS pages
- Environment config (`NUXT_CMS_BASE_URL`) controls provider selection
- `readiness.json` updated with CMS subsystem entry (status: partial)

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — the pattern this follows
- [Architecture](../architecture.md) — system overview with CMS in provider diagram
- [Provider Pattern Guide](../provider-pattern.md) — implementation details including CMS
- [Product Roadmap](../product-roadmap/) — CMS integration roadmap items
