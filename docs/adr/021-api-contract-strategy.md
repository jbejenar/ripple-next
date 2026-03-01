# ADR-021: API Contract Strategy — oRPC, OpenAPI-First Boundary, Public/Internal Classification

**Status:** Accepted
**Date:** 2026-02-28
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

Ripple Next serves three distinct consumer classes:

1. **Internal domains** — Nuxt frontend calling its own server endpoints (tRPC today)
2. **Cross-agency APIs** — shared services between government agencies (public,
   versioned, discoverable)
3. **External integrators** — third parties consuming APIs via a portal/registry

The existing API surface is small:

- **tRPC:** 1 user router with 4 procedures (`me`, `getById`, `create`, `list`)
- **REST (H3):** 6 CMS endpoints (file-based routing), 1 health endpoint
- **Auth routes:** 3 H3 routes (callback, logout, redirect)

The platform's AI-first ethos (ADR-018) requires contracts that are
**machine-readable, deterministic, and toolable** — agents must be able to
discover, validate, and reason over API boundaries without parsing source code.

### Decision Drivers

1. **External integrators need discoverable contracts** — an API portal requires
   a standardised spec format (OpenAPI is the industry default)
2. **AI-first operability** — agents need a single canonical contract to reason
   about; dual-stack patterns create confusion and drift
3. **Minimal migration cost** — the tRPC surface is 1 router with 4 procedures;
   migration is cheap now but compounds with growth
4. **Provider pattern alignment** — API transport should be a thin boundary layer;
   business logic stays in repositories and services (ADR-003)
5. **Lambda-first compute** — the framework must work with Lambda via Nitro
   (ADR-005)

## Options Considered

### Option A: Stay with tRPC, bolt on OpenAPI

Keep tRPC as the primary framework. Generate OpenAPI via a plugin or bridge.

**Pros:**
- Zero migration work
- Existing Nuxt tRPC ecosystem (nuxt-trpc, sidebase)
- Strong TypeScript inference for internal consumers

**Cons:**
- The most prominent tRPC-to-OpenAPI bridge (`trpc-openapi`) is **archived** — a
  real risk for long-lived ecosystems
- OpenAPI becomes a second-class afterthought rather than the source of truth
- tRPC's binary protocol is opaque to non-TypeScript consumers and AI agents
- Two truths: the TypeScript types vs the generated OpenAPI spec

**Verdict:** Rejected. Archived OpenAPI bridge is a maintenance trap. Bolted-on
specs drift from the implementation.

### Option B: oRPC as canonical boundary (selected)

Replace tRPC with oRPC for all API routes. OpenAPI 3.1.1 generation is
first-class. TypeScript inference preserved.

**Pros:**
- OpenAPI 3.1.1 is a **first-class build product**, not an afterthought
- AWS Lambda adapter available — fits SST/Lambda-first compute
- TypeScript type inference comparable to tRPC
- Vue ecosystem integration available (Pinia Colada, TanStack Query)
- One framework, one contract, one source of truth
- Contract-as-code: the router definition *is* the spec

**Cons:**
- Smaller ecosystem than tRPC (newer project)
- Migration work required (though minimal with current surface)
- Team must learn a new API

**Verdict:** Selected. OpenAPI-first aligns with AI-first ethos and external
integrator requirements. Migration cost is minimal now.

### Option C: Hybrid — oRPC public, tRPC internal

Keep tRPC for internal routes (dev speed), add oRPC for public-facing APIs.
Both call the same service/repository layer.

**Pros:**
- Existing internal code unchanged
- oRPC only for portal-published endpoints

**Cons:**
- Two competing frameworks = dual-stack bloat
- Agents must understand which pattern to use where
- Convention boundary is ambiguous and will drift
- ADR-018 explicitly warns against patterns that cause "agent confusion from
  dual-stack patterns"

**Verdict:** Rejected. Two frameworks is how codebases get obese. The current
tRPC surface is too small to justify protecting.

### Option D: API gateway with hand-written OpenAPI

Deploy an API gateway (Kong, AWS API Gateway) that owns the OpenAPI contract.
Backend services implement whatever they want.

**Pros:**
- Complete separation of contract and implementation
- Gateway handles auth, rate limiting, versioning

**Cons:**
- Contract drifts from implementation (gateway spec is hand-maintained)
- Extra infrastructure component to deploy and manage
- Violates SST resource-linking model (ADR-004)
- Agents can't verify contract-implementation consistency

**Verdict:** Rejected. Hand-maintained contracts are the exact anti-pattern that
causes drift. The spec must be generated from code.

## Decision

**Adopt oRPC as the canonical API boundary framework.** All API endpoints —
public and internal — use oRPC routers with first-class OpenAPI 3.1.1 generation.

### 1. Framework

oRPC replaces tRPC for all API transport. Domain logic stays in repositories
and services (provider pattern, ADR-003). The transport layer is thin:

```
Client → oRPC router → Repository/Service → Provider → Infrastructure
```

The router layer does three things only:
1. Validate input (Zod schemas, shared via `@ripple-next/validation`)
2. Enforce auth (middleware)
3. Delegate to repositories/services

No business logic in the transport layer.

### 2. Endpoint Classification

Every route carries a `visibility` tag:

| Visibility | Published to portal | Versioned | Breaking-change gated |
|------------|--------------------:|:---------:|:---------------------:|
| `public`   | Yes                 | Yes       | Yes                   |
| `internal` | No                  | No        | No (tested internally)|

Classification is set via oRPC route metadata:

```ts
const listUsers = os
  .route({ method: 'GET', path: '/users', tags: ['users'] })
  .meta({ visibility: 'public' })
  .input(listUsersSchema)
  .handler(async ({ input, context }) => { ... })
```

The `generate:openapi` command filters by visibility when producing the
publishable spec. Internal routes are excluded from the portal artifact.

### 3. Contract Artifact Pipeline

```
oRPC router definition
  → pnpm generate:openapi          (deterministic openapi.json)
  → pnpm check:api-contract        (CI drift detection)
  → portal publication              (deferred — Backstage, S3, etc.)
```

- **`pnpm generate:openapi`** — generates `docs/api/openapi.json` from the oRPC
  router. Deterministic output (sorted keys, stable ordering). Supports
  `--check` mode that exits non-zero if the committed spec is out of date.
- **`pnpm check:api-contract`** — CI gate that runs `generate:openapi --check`.
  Wired into `pnpm verify`. Fails the build if the committed OpenAPI spec
  drifts from the router definition.
- **Portal publication** — deferred to a follow-up item. The spec is a build
  artifact; the publication target (Backstage, S3 + SwaggerUI, etc.) is
  an infrastructure concern, not an API contract concern.

### 4. Versioning

- Public API routes use a `/v1/` base path prefix
- Version bumps require a new ADR or explicit changelog entry
- Deprecation: endpoints are marked `deprecated: true` in route metadata for at
  least one minor version before removal
- Breaking changes to public endpoints are blocked by CI unless accompanied by
  a version bump and migration notes

### 5. Migration Path

The migration is incremental and low-risk:

| Phase | Scope | Ticket |
|-------|-------|--------|
| **Phase 1** | ADR accepted. `generate:openapi` and `check:api-contract` scripts created. Stubs active, gates ready. | RN-051 (this ADR) |
| **Phase 2** | Install oRPC. Migrate user router (4 procedures). Generate first `openapi.json`. Integration tests via Testcontainers. | RN-046 (updated) |
| **Phase 3** | Classify all endpoints (public/internal). Migrate CMS REST endpoints to oRPC if warranted, or keep as internal H3 routes. | Follow-up |
| **Phase 4** | Contract testing across consumers using OpenAPI spec. Portal publication. | RN-025 |

Auth routes (`/auth/callback`, `/auth/redirect`, `/auth/logout`) remain as H3
handlers — they are OAuth protocol endpoints, not API resources.

CMS REST endpoints may remain as H3 handlers if they are internal-only
(consumed only by the Nuxt frontend). If agencies need CMS content APIs in the
portal, they migrate to oRPC routes with `visibility: 'public'`.

## Rationale

### Why oRPC over tRPC for an AI-first platform

- **One canonical contract** — agents reason over a single OpenAPI spec, not
  TypeScript types that require a TS compiler to interpret
- **Machine-readable by design** — OpenAPI is the most widely tooled API
  description format; every API portal, SDK generator, and testing tool speaks it
- **Contract drift is impossible** — the spec is generated from the router
  definition, not hand-maintained separately
- **External integrators are first-class** — agencies get the same spec that CI
  validates, not a manually maintained approximation
- **"Thin adapters, fat domain"** — the provider pattern (ADR-003) already
  isolates business logic from infrastructure. oRPC is just another thin adapter
  at the HTTP boundary

### Why not defer the decision

The current tRPC surface is 4 procedures. Every new router added before this ADR
lands is a procedure that must be migrated later. The migration cost only goes
up. Deciding now, while the surface is minimal, is the cheapest option.

## Consequences

### Positive

- **Single source of truth** for API contracts — the oRPC router is the spec
- **AI agents can discover and validate APIs** without parsing TypeScript
- **External integrators** get a publishable, versioned OpenAPI artifact
- **CI prevents contract drift** — breaking changes are caught before merge
- **Migration cost is minimal** — 4 procedures to port
- **Provider pattern extended** — API transport joins queue, auth, storage as a
  boundary concern with a clean interface

### Negative

- **oRPC is newer than tRPC** — smaller community, fewer battle-tested examples.
  Mitigated by: our surface is simple CRUD, and OpenAPI backing means we could
  switch frameworks without changing the published contract.
- **Learning curve** — team must learn oRPC conventions. Mitigated by: strong
  similarity to tRPC patterns, and code generators (`generate:endpoint`) will be
  updated to emit oRPC boilerplate.
- **Existing tRPC ecosystem in Nuxt** is more mature. Mitigated by: our Nuxt
  integration is minimal (a single catch-all handler).

### Neutral

- Auth routes remain as H3 handlers (not an API contract concern)
- CMS endpoints decision (H3 vs oRPC) deferred to Phase 3
- Portal publication target deferred (infrastructure concern)
- Error taxonomy gains two new codes: RPL-API-001 (contract drift),
  RPL-API-002 (breaking change detected)

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — domain logic isolation
- [ADR-005: Lambda Default](./005-lambda-default-ecs-escape.md) — compute model
- [ADR-018: AI-First Workflow Strategy](./018-ai-first-workflow-strategy.md) — agent operability
- [RN-046: Router Integration Harness](../product-roadmap/README.md) — Phase 2 migration
- [RN-025: Contract Testing](../product-roadmap/README.md) — Phase 4 consumer contracts
