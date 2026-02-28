# Project: Ripple Next

## Overview

A full-stack government digital platform built with Nuxt 3, Ripple UI,
and TypeScript. Deployed to AWS via SST v3 (Pulumi — NOT CDK/CloudFormation).
Port of the Victorian government Ripple design system to an AI-agent-first architecture.

## Architecture Model

**Hybrid monorepo** — this repo is the development hub for all `@ripple/*` packages.
Packages are published to a private npm registry so external projects consume versioned
releases (e.g. `"@ripple/auth": "^0.2.0"`). Consumer teams upgrade at their own pace —
no coordinated redeployments needed. See [ADR-007](docs/adr/007-library-vs-monorepo.md).

## Subsystem Status

Check `docs/readiness.json` for machine-readable status of each subsystem.
Status values: `implemented` | `partial` | `scaffold` | `planned`.

## Agent-First Bootstrap

Before starting work, validate the environment:

```bash
pnpm bootstrap          # install + doctor + validate (recommended for first setup)
pnpm doctor             # checks Node, pnpm, registry, Docker, env vars, turbo
pnpm doctor -- --json   # machine-readable output for CI agents
pnpm doctor -- --offline # skip network checks (ephemeral/offline runners)
```

If `pnpm doctor` fails, fix the failures before running quality gates.
The doctor script is the single source of truth for environment readiness.
Doctor `--json` output includes `taxonomyCode` fields (e.g. `RPL-ENV-001`) —
look up codes in `docs/error-taxonomy.json` for severity, remediation steps,
and automatable flags.

Copy `.env.example` to `.env` for local development defaults.

## Tech Stack

- Frontend: Nuxt 3 + Vue 3 Composition API + TypeScript
- UI: Ripple UI Core (forked), UnoCSS, Storybook 10
- API: Nitro server routes + tRPC-nuxt
- DB: PostgreSQL (Drizzle ORM), DynamoDB (ElectroDB), Redis
- Queue: SQS (prod) / BullMQ (local) / Memory (test)
- Auth: OIDC/OAuth (oauth4webapi) — provider-agnostic
- Infra: SST v3 (Pulumi/Terraform) — NOT CDK, NOT CloudFormation
- Compute: Lambda (default) + ECS Fargate (long-running only)
- Testing: Vitest, Vue Test Utils, Playwright, Testcontainers

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
  - Tests ALWAYS use memory/mock providers. Never depend on cloud services.

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
tRPC routers receive the database connection via context (`ctx.db`) and
instantiate repositories per-request:

```ts
const repo = new UserRepository(ctx.db)
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
- Server-side tRPC utilities (e.g. `import { router, protectedProcedure } from '../trpc/trpc'`)

### If you see import errors:

Run `npx nuxi prepare apps/web` to regenerate the `.nuxt/` types directory.

## Commands

- `pnpm install` — Install all dependencies
- `pnpm doctor` — Validate environment readiness (run before quality gates)
- `pnpm dev` — Start Nuxt dev + docker-compose services
- `pnpm build` — Build all packages and apps
- `pnpm test` — Run all Vitest tests (unit + integration)
- `pnpm test:ci` — Run tests with JUnit reporter (canonical CI entrypoint)
- `pnpm test:e2e` — Run Playwright E2E tests
- `pnpm test:ui` — Run Storybook component tests
- `pnpm lint` — ESLint (no-console is an error, not a warning)
- `pnpm lint:fix` — Auto-fix lint issues
- `pnpm typecheck` — TypeScript type checking (tsc --noEmit)
- `pnpm validate:env` — Validate environment variables against Zod schema (ADR-012)
- `pnpm check:readiness` — Verify readiness.json is not stale (runs in CI)
- `pnpm check:quarantine` — Verify flaky test quarantine policy (ADR-013, runs in CI)
- `pnpm check:iac` — IaC policy scan for sst.config.ts (RN-036, runs in CI on infra changes)
- `pnpm check:fleet-drift` — Fleet drift detection against golden-path source (RN-024)
- `pnpm check:fleet-drift -- --target=<path>` — Check a downstream repo for drift
- `pnpm check:fleet-drift -- --json` — Machine-readable drift report (`ripple-fleet-drift/v1`)
- `pnpm fleet:sync -- --target=<path>` — Generate sync actions for a downstream repo
- `pnpm fleet:sync -- --dry-run` — Preview sync actions without making changes
- `pnpm fleet:compliance -- --json` — Fleet-wide compliance report (`ripple-fleet-compliance/v1`)
- `pnpm verify` — Run all quality gates with structured summary (RN-034)
- `pnpm verify -- --json` — Machine-readable JSON gate summary (`ripple-gate-summary/v1`)
- `pnpm verify -- --ci` — Write `gate-summary.json` for CI artifact upload
- `pnpm verify -- --fleet` — Include fleet drift gate in quality checks
- `pnpm generate:component <name>` — Scaffold Vue SFC + test + story + index export (RN-041)
- `pnpm generate:provider <package> <name>` — Scaffold provider class + conformance test
- `pnpm generate:endpoint <router> <procedure>` — Scaffold tRPC router + validation + test
- `pnpm generate:package <name>` — Scaffold full @ripple/* package (types, index, tests, configs)
- `pnpm runbook <name>` — Print structured runbook steps (RN-039)
- `pnpm runbook --list` — List all available runbooks
- `pnpm runbook <name> -- --json` — Machine-readable JSON runbook output
- `pnpm changeset` — Add version intent for published package changes
- `pnpm db:generate` — Generate Drizzle migration from schema changes
- `pnpm db:migrate` — Run pending migrations
- `pnpm db:seed` — Seed development data
- `pnpm db:studio` — Open Drizzle Studio (DB browser)
- `pnpm storybook` — Start Storybook dev server
- `npx sst dev` — Start SST live dev (deploys to AWS, proxies locally)
- `npx sst deploy --stage staging` — Deploy to staging
- `npx sst deploy --stage production` — Deploy to production
- `pnpm test:a11y` — Standalone WCAG 2.1 AA accessibility audit with axe-core (RN-042)
- `pnpm session:start` — Start agent session tracking (RN-043)
- `pnpm session:end` — End session and capture metrics (`--run-gates` to include gate results)
- `pnpm session:snapshot` — Mid-session checkpoint of current progress
- `pnpm agent:metrics` — Aggregate session metrics for friction analysis (`--json` for machine-readable)
- `pnpm deploy:health-check <url>` — Post-deploy health validation with retries (RN-035)

## Code Conventions

- All components use `<script setup lang="ts">` (Composition API only)
- UI components follow atomic design: atoms → molecules → organisms → page templates
- CSS uses BEM with `rpl-` prefix for Ripple components, `app-` for app components
- API routes go in `apps/web/server/api/` or `apps/web/server/trpc/routers/`
- All functions and methods must have explicit TypeScript return types
- No `any` types — use `unknown` with type guards instead
- Zod schemas in `packages/validation/` are shared between frontend and backend
- Repository pattern for all database access (`packages/db/repositories/`)
- Lambda handlers go in `services/*/` — one function per file
- ECS services have a Dockerfile in their service directory

## Testing Requirements

- Every new feature needs: unit test + integration test (minimum)
- Every new API endpoint needs: contract test + integration test with real DB (testcontainers)
- Every new component needs: component test with Vue Test Utils
- Every Lambda handler needs: unit test with mock providers
- **Every new provider** needs: conformance test from `packages/testing/conformance/`
- Use factories from `packages/testing/factories/` for test data
- Use mock providers from `packages/testing/mocks/providers.ts`
- Always run `pnpm test` and `pnpm typecheck` before considering work done

### Coverage Thresholds (Enforced in vitest.workspace.ts)

| Risk Tier | Packages | Lines/Functions/Statements | Branches |
|---|---|---|---|
| Tier 1 (Critical) | auth, db, queue | 60% | 50% |
| Tier 2 (Infrastructure) | cms, email, storage, events, validation | 40% | 30% |
| Tier 3 (UI/Services) | ui, worker | 20% | 10% |

Never lower a threshold — only raise it.

## Infrastructure Changes

- All infra is in `sst.config.ts` (TypeScript, NOT YAML, NOT CloudFormation)
- Lambda is the default compute — use `queue.subscribe()` or `sst.aws.Cron`
- Only use ECS Fargate for jobs >15min or WebSocket services
- Use SST `link` to pass resources to functions — never hardcode ARNs or URLs
- Test infra changes with `npx sst deploy --stage pr-123` (isolated per PR)

## CI Pipeline (Tiered)

The CI runs a tiered model to balance speed with safety:

- **Tier 1 (every PR):** lint, typecheck, env schema validation, unit tests, readiness drift guard, quarantine policy check — skipped if no source files changed.
- **Tier 2 (merge to main + high-risk PRs):** full E2E via Playwright. High-risk = changes to `packages/auth`, `packages/db`, `packages/queue`, or `sst.config.ts`.
- **Release (main only):** changesets consume version intent, bump packages, publish to private registry. CycloneDX SBOM mandatory (fail-fast) and build provenance attested.
- **Preview deploys:** PRs that touch infra get an isolated `pr-{number}` AWS environment.

### CI Artifacts

Test results are uploaded as structured artifacts on every CI run:

| Artifact | Contents | Retention |
|----------|----------|-----------|
| `test-results-unit` | JUnit XML from Vitest | 30 days |
| `test-results-e2e` | Playwright HTML report | 30 days |
| `playwright-traces` | Playwright traces (failure only) | 7 days |
| `gate-summary` | JSON quality gate summary (`ripple-gate-summary/v1`) | 30 days |
| `iac-policy-report` | IaC policy scan JSON (`ripple-iac-report/v1`) | 30 days |
| `health-report-staging` | Post-deploy health check JSON (`ripple-health-report/v1`) | 30 days |
| `health-report-production` | Post-deploy health check JSON (`ripple-health-report/v1`) | 30 days |
| `sbom-cyclonedx` | CycloneDX SBOM (release only) | 90 days |
| `a11y-report` | Accessibility audit JSON (`ripple-a11y-report/v1`) | 30 days |
| `fleet-drift-report` | Fleet drift detection JSON (`ripple-fleet-drift/v1`) | 30 days |
| `fleet-sync-plan` | Fleet sync PR plan JSON (`ripple-fleet-sync/v1`) | 30 days |
| `session-metrics` | Agent session metrics JSON (`ripple-session-metrics/v1`) | 30 days |

### Reusable Composite Actions

Shared CI steps are in `.github/actions/`:

- **`setup`** — Node.js + pnpm + frozen lockfile install
- **`quality`** — Lint + typecheck + readiness drift guard
- **`test`** — Run tests with JUnit reporter + artifact upload
- **`fleet-drift`** — Fleet drift detection against golden-path source (RN-024)

Downstream repos can reference these for consistent CI setup. See [docs/downstream-workflows.md](docs/downstream-workflows.md) for the consumption guide, example workflows, and version pinning strategy.

## Health Check

The `/api/health` endpoint reports service readiness:

- `GET /api/health` — full check (DB + Redis connectivity with latency)
- `GET /api/health?quick` — liveness probe only (no dependency checks)

Returns `{ status: "ok"|"degraded"|"unhealthy", timestamp, checks }`.
Use the full check in deployment validation and monitoring.

## Package Publishing

All `@ripple/*` packages include `publishConfig`, `exports`, `types`, and `files`
fields for npm publishing. Packages build to `dist/` via `tsc`.

Versioning uses **Changesets**. When a PR changes a published package's public
API or behavior:

1. Run `pnpm changeset` to describe the change and select the semver bump.
2. Commit the generated `.changeset/*.md` file with your PR.
3. On merge to main, the release workflow consumes changesets, bumps versions,
   updates changelogs, and publishes to the private registry.

## Toolchain Pinning

Exact runtime versions are enforced to eliminate version drift across agent runs,
CI, and developer machines.

### Sources of Truth

| Tool | Source of Truth | Read By |
|------|----------------|---------|
| Node.js | `.nvmrc` (exact version, e.g. `22.22.0`) | nvm, fnm, volta, CI (`node-version-file`), doctor script |
| pnpm | `package.json` → `packageManager` field (e.g. `pnpm@9.15.4`) | corepack, `pnpm/action-setup@v4`, doctor script |

### How Enforcement Works

- **Local:** `pnpm doctor` reads `.nvmrc` and `packageManager`, warns on Node mismatch, fails on pnpm mismatch.
- **CI:** `.github/actions/setup/action.yml` reads `.nvmrc` via `node-version-file` and `packageManager` via `pnpm/action-setup@v4`.
- **Devcontainer:** Uses Node 22 base image; corepack enables pinned pnpm from `packageManager`.
- **`package.json` engines:** Lower-bound safety net (`>=22.14.0` for Node, `>=9.15.4` for pnpm).

### Upgrade Procedure

To bump Node.js or pnpm, update **all** sources of truth in a single PR:

**Node.js bump:**
1. Update `.nvmrc` with the new exact version (e.g. `22.16.0`)
2. Update `package.json` → `engines.node` lower bound if needed
3. Update `.devcontainer/Dockerfile` base image tag if major version changes
4. Update `.devcontainer/devcontainer.json` node feature version if major version changes
5. Run `pnpm doctor` to verify — should show the new pinned version
6. Run `pnpm test` to verify nothing breaks

**pnpm bump:**
1. Update `package.json` → `packageManager` field (e.g. `pnpm@9.16.0`)
2. Update `package.json` → `engines.pnpm` lower bound if needed
3. Run `corepack enable pnpm` to activate the new version
4. Run `pnpm install` to regenerate lockfile if needed
5. Run `pnpm doctor` to verify — should show the new pinned version
6. Run `pnpm test` to verify nothing breaks

## File Naming

- Components: PascalCase (`UserProfile.vue`)
- Composables: camelCase with `use` prefix (`useAuth.ts`)
- Lambda handlers: kebab-case with `.handler.ts` suffix (`email.handler.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`UserSession.ts`)
- Tests: same name as source with `.test.ts` suffix
- Factories: same name as entity with `.factory.ts` suffix
- Dockerfiles: in the service directory they belong to

## Repository Structure

```
apps/web/          — Nuxt 3 application (deploys to Lambda)
  components/      — Page templates (Landing, Content, Campaign) — RN-023
packages/ui/       — Ripple-based UI component library
packages/db/       — Database layer (Drizzle + Postgres)
packages/queue/    — Queue abstraction (provider pattern)
packages/auth/     — Authentication package
packages/storage/  — File storage abstraction
packages/cms/      — CMS content layer (Drupal/Tide + Mock)
packages/email/    — Email abstraction
packages/events/   — Domain event bus
packages/validation/ — Shared Zod validation schemas
packages/shared/   — Shared types and utilities
packages/testing/  — Shared test infrastructure
services/worker/   — Queue consumer service (Lambda + ECS)
services/websocket/ — WebSocket service (ECS Fargate)
services/cron/     — Cron job handlers (Lambda)
services/events/   — EventBridge event handlers (Lambda)
docs/              — Architecture docs, ADRs, readiness manifest
scripts/           — Developer/agent tooling (doctor, etc.)
.github/actions/   — Reusable composite actions (setup, quality, test)
.github/workflows/ — CI, security, release, deploy workflows
```

## Shared Package Ownership

Critical shared surfaces require review from owning teams (see `.github/CODEOWNERS`):

- **Infrastructure** (`sst.config.ts`, workflows, root configs): platform team
- **Database schema/migrations**: platform + data teams
- **Auth package**: platform + security teams
- **Provider interfaces** (`types.ts` in each package): platform team
- **Shared types/validation**: platform team

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
| New ADR | Add to `docs/adr/README.md` index, cross-reference in architecture.md + README.md |
| Fleet policy change | Update `docs/fleet-policy.json`, run `pnpm check:fleet-drift`, update downstream docs |
| New governed surface | Add to `fleet-policy.json`, add error taxonomy code, update ADR-019 |
