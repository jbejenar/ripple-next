# Developer Guide

Complete guide from a bare Mac to running, testing, and deploying Ripple Next.

## Start Here: What kind of development are you doing?

Most confusion comes from mixing two valid workflows. This repo supports both:

1. **Platform development (inside this monorepo)**
   - You are changing `apps/web` and/or `packages/*` in `ripple-next` itself.
   - Use this when you are building or changing the shared Ripple platform.
2. **Consumer app development (separate app repo)**
   - You are building your own app that depends on published `@ripple/*` packages.
   - Use this when your team is consuming Ripple as a library.

> **Do you need to replicate this repo?**
>
> - **No** for normal consumer app work: create a separate app repo and install `@ripple/*` packages from the private npm registry.
> - **No** for platform contributions: clone this repo once and work directly in it.
> - **Only clone/fork this repo** if you need to modify platform internals (shared packages, providers, infra, docs, or `apps/web`).

## Prerequisites

| Requirement | Version | How to install                                                                 |
| ----------- | ------- | ------------------------------------------------------------------------------ |
| Node.js     | >= 22   | `nvm install 22` or `brew install node@22`                                     |
| pnpm        | >= 9    | `corepack enable pnpm` (bundled with Node 22)                                  |
| Docker      | Latest  | [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/) |
| Git         | Latest  | `brew install git` or Xcode Command Line Tools                                 |

Optional but recommended:

| Tool                                 | Purpose                                  |
| ------------------------------------ | ---------------------------------------- |
| [nvm](https://github.com/nvm-sh/nvm) | Node version management (reads `.nvmrc`) |
| AWS CLI v2                           | Deploying to staging/production          |
| SST CLI                              | `npx sst` — no separate install needed   |

## 1. Clone and Bootstrap

```bash
git clone <repository-url>
cd ripple-next

# nvm users: auto-switch to Node 22
nvm use

# One-command setup: install deps + validate environment
pnpm bootstrap
```

`pnpm bootstrap` runs three steps:

1. `pnpm install --frozen-lockfile` — install all dependencies
2. `pnpm doctor` — validate your environment (Node, pnpm, Docker, env vars, turbo)

If bootstrap fails, run `pnpm doctor` to see which checks are failing.

## 1A. Platform developer workflow (this repo)

If you are changing Ripple internals, stay in this repository and follow this sequence:

```bash
pnpm doctor
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Make your changes, then run the quality gates before opening a PR:

```bash
pnpm test
pnpm lint
pnpm typecheck
```

Typical platform tasks:

- Add/modify reusable APIs in `packages/*`
- Update Nuxt app behavior in `apps/web`
- Add provider implementations and conformance tests
- Update infra in `sst.config.ts`
- Improve docs in `docs/*`

## 1B. Consumer app workflow (separate repo) — example

If your team is building a product _with_ Ripple libraries, create a separate repo. Do **not** copy the whole monorepo.

### Example: create a Nuxt consumer app

```bash
# Create a new app repo
mkdir my-service-portal && cd my-service-portal
git init

# Create a Nuxt app
pnpm dlx nuxi@latest init .
pnpm install

# Configure private registry auth (org-specific)
# Usually done via ~/.npmrc or project .npmrc

# Install Ripple packages you need
pnpm add @ripple/auth @ripple/ui @ripple/validation
```

Create a page using Ripple packages:

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { z } from 'zod'
import { loginSchema } from '@ripple/validation'

const status = ref<'idle' | 'valid'>('idle')

const validateExample = (): void => {
  const candidate = { email: 'user@example.com', password: 'example-password' }
  const mergedSchema = loginSchema.and(z.object({ password: z.string().min(8) }))
  mergedSchema.parse(candidate)
  status.value = 'valid'
}
</script>

<template>
  <main>
    <h1>Service Portal</h1>
    <button type="button" @click="validateExample">Validate sample login payload</button>
    <p>Validation state: {{ status }}</p>
  </main>
</template>
```

Run the consumer app:

```bash
pnpm dev
```

### How consumer apps should track Ripple updates

1. Keep Ripple dependencies versioned normally (for example, `^0.2.0`).
2. Let platform team publish updates from this monorepo.
3. Upgrade on your schedule:

```bash
pnpm up @ripple/auth @ripple/ui @ripple/validation
pnpm test
```

This is the core hybrid-monorepo model in [ADR-007](./adr/007-library-vs-monorepo.md): platform code evolves here; consumer apps upgrade independently.

## 2. Configure Environment

```bash
cp .env.example .env
```

The `.env.example` file is the authoritative contract for all environment variables. Most defaults work out of the box for local development. Key sections:

| Section   | Required for local dev? | Notes                                                                                |
| --------- | ----------------------- | ------------------------------------------------------------------------------------ |
| Database  | Yes                     | `DATABASE_URL` and `NUXT_DATABASE_URL` — defaults connect to docker-compose Postgres |
| Redis     | Yes                     | `REDIS_URL` — defaults connect to docker-compose Redis                               |
| Auth/OIDC | No                      | Leave `NUXT_OIDC_ISSUER_URL` empty to use MockAuthProvider                           |
| Storage   | No                      | MinIO defaults work with docker-compose                                              |
| Email     | No                      | Mailpit defaults work with docker-compose                                            |
| CMS       | No                      | Leave `NUXT_CMS_BASE_URL` empty to use MockCmsProvider                               |
| AWS       | No                      | Only needed for deployed environments                                                |

**Provider auto-selection**: When environment variables are empty, the system uses mock/memory providers automatically. You don't need Drupal, Keycloak, or AWS to develop locally. See [Provider Pattern](./provider-pattern.md).

## 3. Start Local Services

```bash
docker compose up -d
```

This starts six services:

| Service       | Port(s)                    | Credentials                 | Purpose                                                 |
| ------------- | -------------------------- | --------------------------- | ------------------------------------------------------- |
| PostgreSQL 17 | 5432                       | `app` / `devpassword`       | Primary database                                        |
| Redis 7       | 6379                       | —                           | Caching and queues                                      |
| MinIO         | 9000 (API), 9001 (console) | `minioadmin` / `minioadmin` | S3-compatible file storage                              |
| Mailpit       | 1025 (SMTP), 8025 (UI)     | —                           | Email testing ([localhost:8025](http://localhost:8025)) |
| MeiliSearch   | 7700                       | master key: `devkey`        | Search indexing                                         |
| Keycloak 26   | 8080                       | `admin` / `admin`           | OIDC/OAuth provider (optional)                          |

Check service health:

```bash
docker compose ps
```

## 4. Set Up the Database

```bash
# Run all pending migrations
pnpm db:migrate

# Seed development data (admin + user accounts, sample project)
pnpm db:seed

# Optional: open Drizzle Studio to browse the database
pnpm db:studio
```

Seed data includes:

- `admin@example.com` (role: admin)
- `user@example.com` (role: user)
- A sample project owned by the admin

## 5. Start Development

```bash
pnpm dev
```

This starts the Nuxt 3 dev server on [localhost:3000](http://localhost:3000) with hot module replacement.

Other development commands:

| Command          | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `pnpm storybook` | Start Storybook on [localhost:6006](http://localhost:6006) |
| `pnpm db:studio` | Open Drizzle Studio database browser                       |
| `pnpm build`     | Build all packages and apps                                |

## 6. Run Quality Gates

Every change must pass these gates before merge:

```bash
pnpm test        # All Vitest unit + integration tests
pnpm lint        # ESLint — no-console is an ERROR
pnpm typecheck   # TypeScript strict mode — zero errors
```

Additional quality commands:

| Command                | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `pnpm test:e2e`        | Playwright end-to-end tests (requires built app)                                     |
| `pnpm test:ui`         | Storybook component tests                                                            |
| `pnpm lint:fix`        | Auto-fix lint issues                                                                 |
| `pnpm format`          | Prettier format all files                                                            |
| `pnpm format:check`    | Check formatting without writing                                                     |
| `pnpm validate:env`    | Validate env vars against Zod schema ([ADR-012](./adr/012-env-schema-validation.md)) |
| `pnpm check:readiness` | Verify `docs/readiness.json` is not stale                                            |
| `pnpm check:quarantine`| Verify flaky test quarantine policy ([ADR-013](./adr/013-flaky-test-containment.md)) |

### Coverage thresholds

Tests enforce risk-tiered coverage thresholds:

| Tier            | Packages                    | Lines/Functions | Branches |
| --------------- | --------------------------- | --------------- | -------- |
| 1 (Critical)    | auth, db, queue             | 60%             | 50%      |
| 2 (Important)   | email, storage, events, cms | 40%             | 30%      |
| 3 (UI/Services) | ui, worker                  | 20%             | 10%      |

Thresholds only go up, never down. See [Testing Guide](./testing-guide.md) for details.

## 7. Repository Structure

```
ripple-next/
├── apps/web/                  # Nuxt 3 application (SSR + Nitro)
│   ├── pages/                 # File-based routing
│   ├── components/            # Vue components (auto-imported)
│   ├── composables/           # Vue composables (auto-imported)
│   ├── server/
│   │   ├── api/               # Nitro API routes (REST + CMS)
│   │   ├── trpc/              # tRPC routers
│   │   └── utils/             # Server utilities
│   └── tests/                 # Unit + E2E tests
├── packages/
│   ├── auth/                  # OIDC/OAuth provider
│   ├── cms/                   # CMS provider (Drupal/Tide + Mock)
│   ├── db/                    # PostgreSQL + Drizzle ORM
│   ├── email/                 # Email provider
│   ├── events/                # Domain event bus
│   ├── queue/                 # Queue provider
│   ├── shared/                # Shared types and utilities
│   ├── storage/               # File storage provider
│   ├── testing/               # Test infrastructure + conformance suites
│   ├── ui/                    # Ripple UI component library
│   └── validation/            # Shared Zod schemas
├── services/
│   ├── worker/                # Background job processor (ECS Fargate)
│   ├── websocket/             # WebSocket service (ECS Fargate)
│   ├── cron/                  # Scheduled jobs (Lambda)
│   └── events/                # Event handlers (Lambda)
├── docs/                      # Architecture docs, ADRs, roadmap
├── scripts/                   # doctor.sh, check-readiness.mjs
├── sst.config.ts              # Infrastructure-as-code (SST v3)
├── docker-compose.yml         # Local dev services
├── vitest.workspace.ts        # Test suite configuration
└── turbo.json                 # Turborepo build pipeline
```

### Key conventions

- **Provider pattern**: Every infrastructure concern (auth, CMS, queue, storage, email, events) has a typed interface with mock, local, and production implementations. Tests always use mock providers. See [Provider Pattern](./provider-pattern.md).
- **Nuxt auto-imports**: `ref`, `computed`, `useState`, `useFetch`, `navigateTo`, etc. are auto-imported. Do NOT add manual imports for these. DO manually import anything from `@ripple/*` packages.
- **`no-console` is an error**: Use `console.warn` or `console.error` only when needed. Test files and handler files are exempt.
- **`no-explicit-any` is an error**: Use `unknown` with type guards instead of `any`.

## 8. Working with the CMS

The CMS layer uses a **decoupled architecture** ([ADR-011](./adr/011-cms-decoupling-pull-out-drupal.md)):

- **MockCmsProvider** — used in development and tests (no Drupal needed)
- **DrupalCmsProvider** — used in production with a Drupal/Tide backend

Drupal-specific code is isolated to exactly 2 files:

- `packages/cms/providers/drupal.ts`
- `packages/cms/providers/tide-paragraph-mapper.ts`

To connect to a live Drupal instance, set these in `.env`:

```bash
NUXT_CMS_BASE_URL=https://your-content-api.example.com
NUXT_CMS_SITE_ID=4
NUXT_CMS_AUTH_USER=api
NUXT_CMS_AUTH_PASSWORD=secret
```

To add a new CMS backend (e.g., Contentful, Strapi):

1. Create `packages/cms/providers/{cms-name}.ts` implementing `CmsProvider`
2. Add the type to `packages/cms/factory.ts`
3. Run the conformance suite — all 18 tests must pass
4. No changes needed to UI, API routes, or existing tests

## 9. Working with Providers

Each provider has a conformance test suite that validates the contract:

```bash
# Example: validate a new queue provider
import { queueConformance } from '@ripple/testing/conformance/queue.conformance'
import { MyQueueProvider } from './my-provider'

queueConformance({
  name: 'MyQueueProvider',
  factory: () => new MyQueueProvider(config),
})
```

Available conformance suites: auth, queue, email, storage, events, CMS.

## 10. Database Changes

```bash
# 1. Edit the Drizzle schema
#    packages/db/schema/

# 2. Generate a migration
pnpm db:generate

# 3. Review the generated SQL
#    packages/db/migrations/

# 4. Apply the migration
pnpm db:migrate

# 5. Update seed data if needed
#    packages/db/seed.ts
```

See [Data Model](./data-model.md) for the schema reference.

## 11. Adding an API Route

### tRPC router (recommended for typed client-server communication)

Add a procedure to an existing router in `apps/web/server/trpc/routers/` or create a new one. See [API Contracts](./api-contracts.md).

### Nitro REST endpoint

Create a file in `apps/web/server/api/`:

```typescript
// apps/web/server/api/my-endpoint.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  // ...
})
```

Nuxt auto-imports `defineEventHandler`, `getQuery`, `readBody`, `createError`, and `setResponseStatus` — no manual imports needed.

## 12. Deployment

### Environments

| Stage      | Trigger              | URL                               |
| ---------- | -------------------- | --------------------------------- |
| Preview    | Per pull request     | `pr-{number}.preview.example.com` |
| Staging    | Merge to `main`      | `staging.example.com`             |
| Production | Manual approval gate | `example.com`                     |

### Deploy commands

```bash
# Preview (per-PR, created automatically by CI)
npx sst deploy --stage pr-123

# Staging (auto-deployed on merge to main)
npx sst deploy --stage staging

# Production (manual approval required)
npx sst deploy --stage production

# Live dev (deploys to AWS, proxies Lambda to your local machine)
npx sst dev

# Tear down a preview environment
npx sst remove --stage pr-123
```

### Infrastructure overview

SST v3 provisions the following on AWS (region `ap-southeast-2`):

| Component | Service                          | Notes                                                 |
| --------- | -------------------------------- | ----------------------------------------------------- |
| VPC       | NAT (EC2, not Gateway) + Bastion | Cost-effective networking                             |
| Database  | Aurora PostgreSQL Serverless v2  | 0.5–8 ACU auto-scaling                                |
| Cache     | ElastiCache Redis                | Session cache, BullMQ backing                         |
| NoSQL     | DynamoDB                         | Single-table design with GSIs                         |
| Storage   | S3                               | CORS-enabled uploads bucket                           |
| Queues    | SQS                              | Email (5m), Image (15m), Long-running (4h) visibility |
| Events    | EventBridge                      | Domain event routing                                  |
| Compute   | Lambda (default)                 | Nuxt app, event handlers, cron jobs                   |
| Compute   | ECS Fargate                      | Worker service, WebSocket service                     |
| Search    | MeiliSearch                      | Content indexing                                      |

See [Deployment Guide](./deployment.md) for more details, [Lambda vs ECS](./lambda-vs-ecs.md) for the compute decision framework.

### CI/CD pipeline

The CI pipeline runs automatically on every PR:

**Tier 1 (every PR)**: lint, typecheck, env schema validation, readiness drift guard, unit tests
**Tier 2 (main or high-risk changes)**: Playwright E2E tests

The release pipeline generates:

- CycloneDX SBOM mandatory (fail-fast, 90-day retention)
- Build provenance attestations
- Automated package publishing via Changesets

See [Architecture](./architecture.md) for CI observability details.

## 13. Publishing Packages

All `@ripple/*` packages are developed in-monorepo and published to a private npm registry:

```bash
# Add a version intent after changing a published package's API
pnpm changeset

# Version packages (CI does this automatically)
pnpm version-packages

# Build + publish (CI release workflow handles this)
pnpm release
```

See [ADR-007](./adr/007-library-vs-monorepo.md) for the hybrid monorepo model.

## 14. Dev Container

A VS Code dev container is included for consistent environments:

```bash
# Open in VS Code
code .

# VS Code will prompt to reopen in dev container
# Or use Command Palette → "Dev Containers: Reopen in Container"
```

The dev container includes Node 22, pnpm, PostgreSQL client, and mounts the workspace with all services configured.

## 15. Troubleshooting

### Environment validation fails

```bash
pnpm doctor              # Human-readable diagnostic
pnpm doctor -- --json    # Machine-readable (for CI/scripts)
pnpm doctor -- --offline # Skip network checks
```

### Docker services won't start

```bash
docker compose down -v   # Remove volumes and restart fresh
docker compose up -d
```

### Database connection errors

1. Check Docker is running: `docker compose ps`
2. Check PostgreSQL is healthy: `docker compose logs postgres`
3. Verify `.env` has correct `DATABASE_URL` (default: `postgres://ripple:ripple@localhost:5432/ripple`)
4. Note: `docker-compose.yml` uses `app`/`devpassword` — update `.env` if not using `.env.example` defaults

### Tests fail with provider errors

Tests use mock/memory providers and never connect to real services. If you see connection errors in tests, check that the test is using `createMockProviders()` from `@ripple/testing`.

### Readiness drift

```bash
pnpm check:readiness
```

If this fails, `docs/readiness.json` is out of date. Update the subsystem status, description, or blockers to match reality.

### Port conflicts

Default ports: PostgreSQL (5432), Redis (6379), MinIO (9000/9001), Mailpit (1025/8025), MeiliSearch (7700), Keycloak (8080), Nuxt (3000), Storybook (6006).

If a port is in use, either stop the conflicting service or change the port mapping in `docker-compose.yml`.

## Related Documentation

- [Architecture](./architecture.md) — system overview, stack, and design
- [Provider Pattern](./provider-pattern.md) — core infrastructure abstraction
- [Data Model](./data-model.md) — PostgreSQL schema
- [API Contracts](./api-contracts.md) — tRPC and REST endpoints
- [Deployment Guide](./deployment.md) — environment-specific deployment
- [Testing Guide](./testing-guide.md) — test pyramid and examples
- [Lambda vs ECS](./lambda-vs-ecs.md) — compute decision framework
- [Product Roadmap](./product-roadmap/) — platform roadmap and scorecard
- [AGENTS.md](../AGENTS.md) — AI agent conventions
- [ADR Index](./adr/) — all Architecture Decision Records
- [ADR-012: Env Schema Validation](./adr/012-env-schema-validation.md) — environment variable validation gate
