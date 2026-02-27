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

## 1B. Consumer app workflow (separate repo)

If your team is building a product _with_ Ripple libraries, create a **separate repo**. Do **not** copy or fork the monorepo — that is only for platform contributors.

The Ripple platform publishes `@ripple/*` packages to a private npm registry. Your consumer repo installs them like any other dependency, upgrades on its own schedule, and deploys independently. See [ADR-007](./adr/007-library-vs-monorepo.md) for the rationale.

---

### Choose your consumer workflow

| Workflow | When to choose | What you install | Run locally | Deploy |
|----------|---------------|-----------------|-------------|--------|
| **Frontend-only** (Nuxt) | Building a website or portal that calls existing APIs | `@ripple/ui`, `@ripple/validation`, `@ripple/shared`, optionally `@ripple/auth` | `pnpm dev` (Nuxt) | Static/SSR host (Vercel, Netlify, Lambda, etc.) |
| **Backend-service-only** | Building an API, worker, or automation that has no UI | `@ripple/validation`, `@ripple/shared`, optionally `@ripple/auth`, `@ripple/queue`, `@ripple/db` | `pnpm dev` (Node server) | Container, Lambda, or VM |
| **Full-stack** (UI + service) | Building a complete product with its own frontend and backend | All of the above, organised in a pnpm workspace | `pnpm dev` (starts both) | UI + API deployed independently |

All three workflows share the same prerequisites: **Node >= 22** and **pnpm >= 9** (`corepack enable pnpm`).

---

### Private registry setup (all workflows)

`@ripple/*` packages are published to a private npm registry. Before you can install them, create a `.npmrc` in your project root:

```ini
# .npmrc — private registry auth for @ripple/* packages
# Replace the URL and token with values from your platform team.
@ripple:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${RIPPLE_NPM_TOKEN}
```

> **Assumption:** This guide uses GitHub Packages as the registry URL. Your organisation may use AWS CodeArtifact or another host — substitute the URL accordingly. The `RIPPLE_NPM_TOKEN` environment variable should be set in your shell profile or CI secrets; never commit a real token.

After creating `.npmrc`, verify access:

```bash
export RIPPLE_NPM_TOKEN=<your-token>
pnpm info @ripple/shared --registry https://npm.pkg.github.com
```

---

### A. Frontend-only consumer app (Nuxt)

A Nuxt app that uses Ripple UI components and validation schemas. No backend of its own.

#### 1. Scaffold

```bash
mkdir my-portal && cd my-portal
git init

pnpm dlx nuxi@latest init .
pnpm install

# Install Ripple packages
pnpm add @ripple/ui @ripple/validation @ripple/shared
```

#### 2. Folder layout

```
my-portal/
├── .npmrc                # Private registry auth (see above)
├── package.json
├── nuxt.config.ts
├── pages/
│   └── index.vue         # Example page
├── tests/
│   └── index.test.ts     # Example unit test
├── tsconfig.json
└── .env.example          # Document env vars your app needs
```

#### 3. Hello Ripple page

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { RplButton, RplHeroHeader } from '@ripple/ui'
import { loginSchema } from '@ripple/validation'
import { formatDate } from '@ripple/shared'

const status = ref<'idle' | 'valid' | 'invalid'>('idle')

function validate(): void {
  const result = loginSchema.safeParse({
    email: 'user@example.com',
    password: 'secure-password-123'
  })
  status.value = result.success ? 'valid' : 'invalid'
}
</script>

<template>
  <RplHeroHeader title="My Service Portal" :description="`Today is ${formatDate(new Date())}`">
    <RplButton label="Validate login payload" @click="validate" />
    <p style="margin-top: 1rem">Validation: {{ status }}</p>
  </RplHeroHeader>
</template>
```

#### 4. Run

```bash
pnpm dev        # Nuxt dev server on http://localhost:3000
```

#### 5. Quality gates

Add these scripts to `package.json`:

```jsonc
{
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "nuxi typecheck"
  }
}
```

Install dev tooling:

```bash
pnpm add -D vitest @vue/test-utils happy-dom eslint typescript
```

Run quality gates before every commit:

```bash
pnpm test        # Unit tests (Vitest)
pnpm lint        # ESLint
pnpm typecheck   # TypeScript strict mode
```

| Gate | What it verifies |
|------|-----------------|
| `pnpm test` | Your unit tests pass; Ripple schemas/utilities work as expected |
| `pnpm lint` | No lint errors (consider adopting `no-console: error` from the platform) |
| `pnpm typecheck` | Zero type errors; catches breaking changes from Ripple upgrades early |

#### 6. Deploy

A frontend-only Nuxt app can be deployed as:

- **SSR** — Lambda (via `npx sst deploy`), Vercel, or any Node host
- **Static** — `nuxi generate` then deploy to S3/CloudFront, Netlify, or GitHub Pages

---

### B. Backend-service-only consumer repo

A standalone Node service (API or worker) that uses `@ripple/*` packages for validation, auth, shared types, or queue processing — no UI.

#### 1. Scaffold

```bash
mkdir my-api && cd my-api
git init
pnpm init

# Install Ripple packages
pnpm add @ripple/validation @ripple/shared @ripple/auth

# Install dev tooling
pnpm add -D typescript vitest tsx @types/node
```

#### 2. Folder layout

```
my-api/
├── .npmrc                 # Private registry auth (see above)
├── .env.example           # Document all env vars (the contract)
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts          # HTTP entry point
│   └── routes/
│       ├── health.ts      # GET /health
│       └── validate.ts    # POST /validate
└── tests/
    └── validate.test.ts   # Unit tests
```

#### 3. `.env.example`

Document every environment variable your service needs. This file is the authoritative contract — the same pattern used throughout the Ripple platform (see [ADR-012](./adr/012-env-schema-validation.md)).

```bash
# .env.example — authoritative env var contract for this service
NODE_ENV=development
PORT=4000

# Auth (leave empty to skip auth checks locally)
OIDC_ISSUER_URL=
OIDC_CLIENT_ID=

# Database (optional — only if your service needs its own DB)
# DATABASE_URL=postgres://myapi:devpassword@localhost:5432/myapi
```

#### 4. Minimal server

This example uses Node's built-in `node:http` module to keep dependencies minimal. Substitute Express, Fastify, or Hono if your team prefers — the Ripple package usage is the same.

```typescript
// src/server.ts
import { createServer } from 'node:http'
import { healthHandler } from './routes/health.js'
import { validateHandler } from './routes/validate.js'

const port = Number(process.env.PORT ?? 4000)

const server = createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    return healthHandler(req, res)
  }
  if (req.url === '/validate' && req.method === 'POST') {
    return validateHandler(req, res)
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
```

```typescript
// src/routes/health.ts
import type { IncomingMessage, ServerResponse } from 'node:http'
import { APP_NAME } from '@ripple/shared'

export function healthHandler(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', platform: APP_NAME }))
}
```

```typescript
// src/routes/validate.ts
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createUserSchema } from '@ripple/validation'

export function validateHandler(req: IncomingMessage, res: ServerResponse): void {
  let body = ''
  req.on('data', (chunk: Buffer) => { body += chunk.toString() })
  req.on('end', () => {
    const result = createUserSchema.safeParse(JSON.parse(body))
    if (result.success) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: true, data: result.data }))
    } else {
      res.writeHead(422, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: false, errors: result.error.issues }))
    }
  })
}
```

#### 5. `package.json` scripts

```jsonc
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

#### 6. Unit test

```typescript
// tests/validate.test.ts
import { describe, it, expect } from 'vitest'
import { createUserSchema } from '@ripple/validation'

describe('createUserSchema', () => {
  it('accepts valid user input', () => {
    const result = createUserSchema.safeParse({
      email: 'dev@example.com',
      name: 'Test User'
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = createUserSchema.safeParse({ name: 'Test User' })
    expect(result.success).toBe(false)
  })
})
```

#### 7. Run

```bash
pnpm dev         # Starts server on http://localhost:4000 with hot reload
pnpm test        # Run unit tests
pnpm typecheck   # Type-check the project
```

#### 8. DB optional: Docker Compose for local services

If your service needs a database or Redis, add a `docker-compose.yml`:

```yaml
# docker-compose.yml — local dev services for this API
services:
  postgres:
    image: postgres:17-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: myapi
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: myapi
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

Then start services before your API:

```bash
docker compose up -d
pnpm dev
```

#### 9. Deploy

A backend-only service can be deployed as:

- **Container** — Docker image to ECS Fargate, Cloud Run, or any container host
- **Lambda** — bundle with esbuild, deploy via SST or Serverless Framework
- **VM** — `pnpm build && node dist/server.js` behind a reverse proxy

---

### C. Full-stack consumer repo (UI + service)

A pnpm workspace with a Nuxt frontend and a backend API in one repo, sharing types and schemas.

#### 1. Scaffold

```bash
mkdir my-product && cd my-product
git init

# Initialise the workspace root
pnpm init
mkdir -p apps/web services/api packages/shared
```

#### 2. Folder layout

```
my-product/
├── .npmrc                    # Private registry auth (see above)
├── .env.example              # Root-level env var contract
├── package.json              # Root scripts (dev, test, lint, typecheck)
├── pnpm-workspace.yaml
├── turbo.json                # Optional: Turborepo for task orchestration
├── apps/
│   └── web/                  # Nuxt frontend
│       ├── nuxt.config.ts
│       ├── pages/
│       │   └── index.vue
│       ├── package.json
│       └── tests/
├── services/
│   └── api/                  # Backend API
│       ├── src/
│       │   └── server.ts
│       ├── package.json
│       └── tests/
└── packages/
    └── shared/               # Local types/schemas shared across apps and services
        ├── index.ts
        └── package.json
```

#### 3. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

#### 4. Root `package.json`

```jsonc
{
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

> **Tip:** If you have more than two workspace packages, add [Turborepo](https://turbo.build) (`pnpm add -D turbo`) and replace the root scripts with `turbo dev`, `turbo test`, etc. for cached, parallel builds. The Ripple platform monorepo uses this pattern.

#### 5. Frontend (`apps/web/package.json`)

```jsonc
{
  "name": "@my-product/web",
  "private": true,
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "nuxi typecheck"
  },
  "dependencies": {
    "@ripple/ui": "^0.1.0",
    "@ripple/validation": "^0.1.0",
    "@ripple/shared": "^0.1.0",
    "@my-product/shared": "workspace:*"
  }
}
```

#### 6. Backend (`services/api/package.json`)

```jsonc
{
  "name": "@my-product/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ripple/validation": "^0.1.0",
    "@ripple/shared": "^0.1.0",
    "@ripple/auth": "^0.1.0",
    "@my-product/shared": "workspace:*"
  }
}
```

#### 7. Shared types (`packages/shared/index.ts`)

```typescript
// packages/shared/index.ts
// Local types shared between frontend and backend in this repo.
// These are NOT published — they use workspace:* links.

export interface ProductConfig {
  siteName: string
  apiBaseUrl: string
}

export const defaultConfig: ProductConfig = {
  siteName: 'My Product',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:4000'
}
```

With a minimal `packages/shared/package.json`:

```jsonc
{
  "name": "@my-product/shared",
  "private": true,
  "type": "module",
  "main": "./index.ts",
  "types": "./index.ts"
}
```

#### 8. UI calls service (env var pattern)

In the Nuxt app, configure the API base URL via environment variable:

```typescript
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
    }
  }
})
```

```vue
<!-- apps/web/pages/index.vue -->
<script setup lang="ts">
import { RplButton } from '@ripple/ui'

const config = useRuntimeConfig()

const result = ref<string>('—')

async function callApi(): Promise<void> {
  const res = await $fetch(`${config.public.apiBaseUrl}/health`)
  result.value = JSON.stringify(res)
}
</script>

<template>
  <main>
    <h1>My Product</h1>
    <RplButton label="Call API" @click="callApi" />
    <pre>{{ result }}</pre>
  </main>
</template>
```

#### 9. `.env.example` (root)

```bash
# .env.example — env var contract for the full-stack repo
NODE_ENV=development

# Frontend
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Backend
PORT=4000

# Auth (leave empty for local dev without auth)
OIDC_ISSUER_URL=
OIDC_CLIENT_ID=
```

#### 10. Run

```bash
pnpm install
cp .env.example .env

# Start both frontend and backend concurrently
pnpm dev

# Nuxt on http://localhost:3000
# API  on http://localhost:4000
```

#### 11. Deployment topology

The frontend and backend deploy and version independently:

| Component | Build command | Deploy target | Notes |
|-----------|--------------|---------------|-------|
| `apps/web` | `nuxi build` | SSR host (Lambda, Vercel, Netlify) or static (`nuxi generate` to S3) | Set `NUXT_PUBLIC_API_BASE_URL` to the production API URL |
| `services/api` | `tsc` | Container (ECS, Cloud Run), Lambda, or VM | Set `PORT`, auth, and DB vars per environment |

A frontend deploy does not require a backend redeploy, and vice versa. Use environment variables (not hardcoded URLs) to wire them together in each environment.

---

### Dependency and upgrade policy (all consumer workflows)

This section applies to all three consumer archetypes: frontend-only, backend-only, and full-stack.

#### Version strategy

| Strategy | When to use | Example |
|----------|-------------|---------|
| **Caret range** (`^0.2.0`) | Default for most teams — accepts compatible minor/patch updates | `"@ripple/ui": "^0.2.0"` |
| **Exact pin** (`0.2.3`) | High-stability environments where any change must be deliberate | `"@ripple/ui": "0.2.3"` |
| **Tilde range** (`~0.2.0`) | Accept patches only, reject new features | `"@ripple/ui": "~0.2.0"` |

> **Recommendation:** Use caret ranges (`^`) and upgrade monthly. This balances stability with staying current on bug fixes and security patches.

#### Upgrade cadence

- **Monthly (recommended):** Run the upgrade checklist below on a regular cadence.
- **On-demand:** Upgrade immediately when a security advisory or breaking change affects you.
- **Never delay major versions** for more than one quarter — the platform team may drop support for older majors.

#### Safe upgrade checklist

```bash
# 1. Update all @ripple/* packages to latest compatible versions
pnpm up '@ripple/*'

# 2. Verify nothing broke
pnpm test
pnpm typecheck
pnpm lint

# 3. Review what changed
pnpm outdated '@ripple/*'          # See current vs latest versions
# Check the platform changelog/release notes for breaking changes

# 4. Commit the updated lockfile
git add pnpm-lock.yaml package.json
git commit -m "chore: upgrade @ripple/* packages"
```

#### Rollback strategy

If an upgrade breaks your app:

```bash
# Revert to the previous lockfile
git checkout HEAD~1 -- pnpm-lock.yaml package.json
pnpm install
pnpm test   # Confirm the rollback works
```

The lockfile (`pnpm-lock.yaml`) is your safety net. Always commit it, and always run tests after modifying it.

This is the core hybrid-monorepo model from [ADR-007](./adr/007-library-vs-monorepo.md): platform code evolves in the monorepo; consumer apps upgrade independently on their own schedule.

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
