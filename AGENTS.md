<!-- This file is intentionally minimal (~185 lines). See ADR-020.
     Do NOT add: command catalogs, directory listings, CI details, or content
     already covered by .github/instructions/ or discoverable from source. -->

# Project: Ripple Next

## Overview

A full-stack government digital platform built with Nuxt 3, Ripple UI,
and TypeScript. Deployed to AWS via SST v3 (Pulumi — NOT CDK/CloudFormation).

**Hybrid monorepo** — `@ripple/*` packages are published to a private npm registry.
Consumer teams upgrade at their own pace. See [ADR-007](docs/adr/007-library-vs-monorepo.md).

## Validate Changes

Run `pnpm verify` after changes — runs all quality gates (lint, typecheck, test, readiness).
Use `pnpm verify -- --json` for machine-readable JSON output (`ripple-gate-summary/v1`).

If you changed a published package's API: `pnpm changeset` to add version intent.

## Agent-First Bootstrap

```bash
pnpm bootstrap          # install + doctor + validate (first-time setup)
pnpm doctor -- --json   # machine-readable environment check with taxonomy codes
```

The doctor script is the single source of truth for environment readiness.
Doctor `--json` output includes `taxonomyCode` fields (e.g. `RPL-ENV-001`) —
look up codes in `docs/error-taxonomy.json` for severity and remediation.

Copy `.env.example` to `.env` for local development defaults.

## Critical Architecture Patterns

### Provider Pattern

Every infrastructure concern uses a provider interface:

- `packages/queue/providers/` → memory.ts | bullmq.ts | sqs.ts
- `packages/auth/providers/` → mock.ts | oidc.ts
- `packages/storage/providers/` → filesystem.ts | minio.ts | s3.ts
- `packages/email/providers/` → smtp.ts (includes MemoryEmailProvider) | ses.ts
- `packages/cms/providers/` → mock.ts | drupal.ts | tide-paragraph-mapper.ts
  - CMS has explicit decoupling: Drupal isolated to 2 files, removable per ADR-011
  - Provider factory (`createCmsProvider()`) auto-selects based on env config

Tests ALWAYS use memory/mock providers. Never depend on cloud services.
New providers MUST pass the conformance suite from `packages/testing/conformance/`.

### Lambda-First Compute

- Default: Lambda via Nitro (request-response, <15 min)
- Escape hatch: ECS Fargate (long-running, WebSocket, batch)
- Never: EKS/Kubernetes
- SST handles all wiring — `sst.aws.Nuxt`, `queue.subscribe()`, `sst.aws.Cron`

### SST Resource Linking

In production, access infrastructure via SST's `Resource` object:

```ts
import { Resource } from 'sst'
// Resource.Database.connectionString, Resource.EmailQueue.url, etc.
```

In tests, use mock providers. In local dev, use docker-compose services.

### Repository Pattern

All database access goes through repositories in `packages/db/repositories/`.
oRPC routers receive the database connection via context (`context.db`) and
instantiate repositories per-request:

```ts
const repo = new UserRepository(context.db)
const user = await repo.findById(input.id)
```

Never access the database directly from route handlers.

## Nuxt Auto-Imports

Nuxt 3 auto-imports the following. Do NOT add manual imports for these:

### Auto-imported by Nuxt core (no import statement needed):

- **Vue APIs**: `ref`, `computed`, `watch`, `watchEffect`, `reactive`, `toRef`, `toRefs`, `onMounted`, `onUnmounted`, `nextTick`, `defineProps`, `defineEmits`, `withDefaults`
- **Nuxt composables**: `useRuntimeConfig`, `useFetch`, `useAsyncData`, `useLazyFetch`, `useLazyAsyncData`, `useRoute`, `useRouter`, `useState`, `useHead`, `useSeoMeta`, `useNuxtApp`, `navigateTo`, `createError`, `definePageMeta`, `defineNuxtRouteMiddleware`
- **Nitro server utils**: `defineEventHandler`, `getQuery`, `readBody`, `createError`, `setResponseStatus`

### Auto-imported from project directories:

- `composables/**` — all exports (e.g. `useAuth()`)
- `stores/**` — all Pinia stores
- `~/components/**` — all Vue components (no pathPrefix)

### NOT auto-imported (you must import explicitly):

- Anything from `@ripple/*` packages (e.g. `import { AuthProvider } from '@ripple/auth'`)
- Anything from `node_modules` (e.g. `import { z } from 'zod'`)
- Server-side oRPC utilities (e.g. `import { protectedProcedure } from '../orpc/base'`)

### If you see import errors:

Run `npx nuxi prepare apps/web` to regenerate the `.nuxt/` types directory.

## Code Conventions

- All components use `<script setup lang="ts">` (Composition API only)
- UI components follow atomic design: atoms → molecules → organisms → page templates
- CSS uses BEM with `rpl-` prefix for Ripple components, `app-` for app components
- All functions and methods must have explicit TypeScript return types
- No `any` types — use `unknown` with type guards instead
- Zod schemas in `packages/validation/` are shared between frontend and backend
- Repository pattern for all database access (`packages/db/repositories/`)

## Lint Rules (Strict)

- `no-console` is an **error** (use `console.warn`/`console.error` if needed)
- `@typescript-eslint/no-explicit-any` is an **error** (use `unknown` + type guards)
- Test files and `migrate.ts`/`seed.ts`/`*.handler.ts` are exempt from no-console

## Coverage Thresholds (Enforced)

| Risk Tier | Packages | Lines/Functions/Statements | Branches |
|---|---|---|---|
| Tier 1 (Critical) | auth, db, queue | 60% | 50% |
| Tier 2 (Infrastructure) | cms, email, storage, events, validation | 40% | 30% |
| Tier 3 (UI/Services) | ui, worker | 20% | 10% |

Never lower a threshold — only raise it.

## Testing Requirements

- Every new feature needs: unit test + integration test (minimum)
- Every new API endpoint needs: contract test + integration test with real DB (testcontainers)
- Every new component needs: component test with Vue Test Utils
- Every Lambda handler needs: unit test with mock providers
- **Every new provider** needs: conformance test from `packages/testing/conformance/`
- Use factories from `packages/testing/factories/` for test data
- Use mock providers from `packages/testing/mocks/providers.ts`

## Agent Task Routing

When making changes, match the change type to the right validation:

| Change Type | Required Validation |
|---|---|
| New API endpoint | `pnpm test`, `pnpm typecheck`, integration test with testcontainers |
| New provider implementation | Conformance test + unit test, `pnpm typecheck` |
| New CMS provider | Implement `CmsProvider` interface, add to factory, run CMS conformance suite (18 tests) |
| CMS Drupal changes | Edit only `providers/drupal.ts` or `tide-paragraph-mapper.ts`, run `pnpm test` |
| Remove Drupal | Follow ADR-011 removal procedure (delete 2 files + update factory/exports) |
| DB schema change | `pnpm db:generate`, migration test, `pnpm typecheck` |
| New Vue component | Component test, `pnpm lint`, Storybook story, check `@storybook/addon-a11y` panel |
| Page template change | Component test, verify CMS contentType mapping in `[...slug].vue` |
| Lambda handler | Unit test with mock providers, `pnpm typecheck` |
| Infrastructure change | `pnpm check:iac`, `npx sst deploy --stage pr-{n}`, review SST diff |
| Package interface change | All downstream consumer tests, `pnpm typecheck` |
| Roadmap/docs change | `pnpm check:readiness`, update `readiness.json`, cross-reference ADRs |
| New ADR | Add to `docs/adr/README.md` index, cross-reference in architecture.md |
| Fleet policy change | Update `docs/fleet-policy.json`, run `pnpm check:fleet-drift` |
| Modifying CLAUDE.md or AGENTS.md | Read [ADR-020](docs/adr/020-context-file-minimalism.md). Only add hard constraints that cause CI failures if unknown. Do NOT add command catalogs, directory listings, or content from `.github/instructions/`. |

## Toolchain Pinning

Exact runtime versions are enforced to eliminate version drift.

| Tool | Source of Truth | Read By |
|---|---|---|
| Node.js | `.nvmrc` (exact version, e.g. `22.22.0`) | nvm, fnm, volta, CI (`node-version-file`), doctor |
| pnpm | `package.json` → `packageManager` field (e.g. `pnpm@9.15.4`) | corepack, `pnpm/action-setup@v4`, doctor |
