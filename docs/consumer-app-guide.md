# Consumer App Guide

Build apps using `@ripple-next/*` packages — frontend, backend, or full-stack.

> **Contributing to the ripple-next monorepo?** See the [Platform Developer Guide](./platform-developer-guide.md).
>
> **Looking for mandatory documentation standards?** See the [Downstream Adoption Guide](./downstream-adoption-guide.md).
>
> **Want an AI agent to do this for you?** See the [AI Adoption Prompts](./ai-adoption-prompts.md).

---

If your team is building a product _with_ Ripple libraries, create a **separate repo**. Do **not** copy or fork the monorepo — that is only for platform contributors.

The Ripple platform publishes `@ripple-next/*` packages to a private npm registry. Your consumer repo installs them like any other dependency, upgrades on its own schedule, and deploys independently. See [ADR-007](./adr/007-library-vs-monorepo.md) for the rationale.

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

## Choose your consumer workflow

| Workflow | When to choose | What you install | Run locally | Deploy |
|----------|---------------|-----------------|-------------|--------|
| **Frontend-only** (Nuxt) | Building a website or portal that calls existing APIs | `@ripple-next/ui`, `@ripple-next/validation`, `@ripple-next/shared`, optionally `@ripple-next/auth` | `pnpm dev` (Nuxt) | Static/SSR host (Vercel, Netlify, Lambda, etc.) |
| **Backend-service-only** | Building an API, worker, or automation that has no UI | `@ripple-next/validation`, `@ripple-next/shared`, optionally `@ripple-next/auth`, `@ripple-next/queue`, `@ripple-next/db` | `pnpm dev` (Node server) | Container, Lambda, or VM |
| **Full-stack** (UI + service) | Building a complete product with its own frontend and backend | All of the above, organised in a pnpm workspace | `pnpm dev` (starts both) | UI + API deployed independently |

All three workflows share the same prerequisites: **Node >= 22** and **pnpm >= 9** (`corepack enable pnpm`).

> **Scaffold shortcut:** Run `pnpm generate:scaffold /path/to/repo --name=my-project --org=my-org`
> to create the full DX infrastructure (~35+ files) including documentation templates,
> CI/CD, quality gates, and fleet governance. See the [Downstream Adoption Guide](./downstream-adoption-guide.md)
> for documentation requirements (product roadmap, architecture doc, readiness manifest, CLAUDE.md).

---

## Private registry setup (all workflows)

`@ripple-next/*` packages are published to a private npm registry. Before you can install them, create a `.npmrc` in your project root:

```ini
# .npmrc — private registry auth for @ripple-next/* packages
# Replace the URL and token with values from your platform team.
@ripple:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${RIPPLE_NPM_TOKEN}
```

> **Assumption:** This guide uses GitHub Packages as the registry URL. Your organisation may use AWS CodeArtifact or another host — substitute the URL accordingly. The `RIPPLE_NPM_TOKEN` environment variable should be set in your shell profile or CI secrets; never commit a real token.

After creating `.npmrc`, verify access:

```bash
export RIPPLE_NPM_TOKEN=<your-token>
pnpm info @ripple-next/shared --registry https://npm.pkg.github.com
```

---

## A. Frontend-only consumer app (Nuxt)

A Nuxt app that uses Ripple UI components and validation schemas. No backend of its own.

### 1. Scaffold

```bash
mkdir my-portal && cd my-portal
git init

pnpm dlx nuxi@latest init .
pnpm install

# Install Ripple packages
pnpm add @ripple-next/ui @ripple-next/validation @ripple-next/shared
```

### 2. Folder layout

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

### 3. Hello Ripple page

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { RplButton, RplHeroHeader } from '@ripple-next/ui'
import { loginSchema } from '@ripple-next/validation'
import { formatDate } from '@ripple-next/shared'

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

### 4. Run

```bash
pnpm dev        # Nuxt dev server on http://localhost:3000
```

### 5. Quality gates

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

### 6. Deploy

A frontend-only Nuxt app can be deployed as:

- **SSR** — Lambda (via `npx sst deploy`), Vercel, or any Node host
- **Static** — `nuxi generate` then deploy to S3/CloudFront, Netlify, or GitHub Pages

---

## B. Backend-service-only consumer repo

A standalone Node service (API or worker) that uses `@ripple-next/*` packages for validation, auth, shared types, or queue processing — no UI.

### 1. Scaffold

```bash
mkdir my-api && cd my-api
git init
pnpm init

# Install Ripple packages
pnpm add @ripple-next/validation @ripple-next/shared @ripple-next/auth

# Install dev tooling
pnpm add -D typescript vitest tsx @types/node
```

### 2. Folder layout

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

### 3. `.env.example`

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

### 4. Minimal server

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
import { APP_NAME } from '@ripple-next/shared'

export function healthHandler(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', platform: APP_NAME }))
}
```

```typescript
// src/routes/validate.ts
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createUserSchema } from '@ripple-next/validation'

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

### 5. `package.json` scripts

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

### 6. Unit test

```typescript
// tests/validate.test.ts
import { describe, it, expect } from 'vitest'
import { createUserSchema } from '@ripple-next/validation'

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

### 7. Run

```bash
pnpm dev         # Starts server on http://localhost:4000 with hot reload
pnpm test        # Run unit tests
pnpm typecheck   # Type-check the project
```

### 8. DB optional: Docker Compose for local services

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

### 9. Deploy

A backend-only service can be deployed as:

- **Container** — Docker image to ECS Fargate, Cloud Run, or any container host
- **Lambda** — bundle with esbuild, deploy via SST or Serverless Framework
- **VM** — `pnpm build && node dist/server.js` behind a reverse proxy

---

## C. Full-stack consumer repo (UI + service)

A pnpm workspace with a Nuxt frontend and a backend API in one repo, sharing types and schemas.

### 1. Scaffold

```bash
mkdir my-product && cd my-product
git init

# Initialise the workspace root
pnpm init
mkdir -p apps/web services/api packages/shared
```

### 2. Folder layout

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

### 3. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

### 4. Root `package.json`

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

### 5. Frontend (`apps/web/package.json`)

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
    "@ripple-next/ui": "^0.1.0",
    "@ripple-next/validation": "^0.1.0",
    "@ripple-next/shared": "^0.1.0",
    "@my-product/shared": "workspace:*"
  }
}
```

### 6. Backend (`services/api/package.json`)

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
    "@ripple-next/validation": "^0.1.0",
    "@ripple-next/shared": "^0.1.0",
    "@ripple-next/auth": "^0.1.0",
    "@my-product/shared": "workspace:*"
  }
}
```

### 7. Shared types (`packages/shared/index.ts`)

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

### 8. UI calls service (env var pattern)

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
import { RplButton } from '@ripple-next/ui'

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

### 9. `.env.example` (root)

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

### 10. Run

```bash
pnpm install
cp .env.example .env

# Start both frontend and backend concurrently
pnpm dev

# Nuxt on http://localhost:3000
# API  on http://localhost:4000
```

### 11. Deployment topology

The frontend and backend deploy and version independently:

| Component | Build command | Deploy target | Notes |
|-----------|--------------|---------------|-------|
| `apps/web` | `nuxi build` | SSR host (Lambda, Vercel, Netlify) or static (`nuxi generate` to S3) | Set `NUXT_PUBLIC_API_BASE_URL` to the production API URL |
| `services/api` | `tsc` | Container (ECS, Cloud Run), Lambda, or VM | Set `PORT`, auth, and DB vars per environment |

A frontend deploy does not require a backend redeploy, and vice versa. Use environment variables (not hardcoded URLs) to wire them together in each environment.

---

## Dependency and upgrade policy

This section applies to all three consumer archetypes: frontend-only, backend-only, and full-stack.

### Version strategy

| Strategy | When to use | Example |
|----------|-------------|---------|
| **Caret range** (`^0.2.0`) | Default for most teams — accepts compatible minor/patch updates | `"@ripple-next/ui": "^0.2.0"` |
| **Exact pin** (`0.2.3`) | High-stability environments where any change must be deliberate | `"@ripple-next/ui": "0.2.3"` |
| **Tilde range** (`~0.2.0`) | Accept patches only, reject new features | `"@ripple-next/ui": "~0.2.0"` |

> **Recommendation:** Use caret ranges (`^`) and upgrade monthly. This balances stability with staying current on bug fixes and security patches.

### Upgrade cadence

- **Monthly (recommended):** Run the upgrade checklist below on a regular cadence.
- **On-demand:** Upgrade immediately when a security advisory or breaking change affects you.
- **Never delay major versions** for more than one quarter — the platform team may drop support for older majors.

### Safe upgrade checklist

```bash
# 1. Update all @ripple-next/* packages to latest compatible versions
pnpm up '@ripple-next/*'

# 2. Verify nothing broke
pnpm test
pnpm typecheck
pnpm lint

# 3. Review what changed
pnpm outdated '@ripple-next/*'          # See current vs latest versions
# Check the platform changelog/release notes for breaking changes

# 4. Commit the updated lockfile
git add pnpm-lock.yaml package.json
git commit -m "chore: upgrade @ripple-next/* packages"
```

### Rollback strategy

If an upgrade breaks your app:

```bash
# Revert to the previous lockfile
git checkout HEAD~1 -- pnpm-lock.yaml package.json
pnpm install
pnpm test   # Confirm the rollback works
```

The lockfile (`pnpm-lock.yaml`) is your safety net. Always commit it, and always run tests after modifying it.

This is the core hybrid-monorepo model from [ADR-007](./adr/007-library-vs-monorepo.md): platform code evolves in the monorepo; consumer apps upgrade independently on their own schedule.

---

## Downstream Compliance

Your consumer app repo is a downstream repo. You must also follow the mandatory
standards in the **[Downstream Adoption Guide](./downstream-adoption-guide.md)**.

Every downstream repo must produce documentation in these 7 categories
(governance is advisory — report only, does not block CI):

1. **Product Roadmap** — `docs/product-roadmap/README.md` (Now/Next/Later timeline)
2. **Architecture Documentation** — `docs/architecture.md` (system overview, stack, providers)
3. **API Contract Documentation** — `docs/api-contracts.md` (if repo has API endpoints)
4. **Architecture Decision Records** — `docs/adr/` (minimum 2 ADRs)
5. **Readiness Manifest** — `docs/readiness.json` (subsystem status and maturity)
6. **README.md** — project purpose, setup, architecture overview
7. **CLAUDE.md** — verify command, lint rules, key patterns (~40 lines)

Run `pnpm conform -- --target=/path/to/repo` to check your documentation compliance score (passing threshold: 70/100).

See the [Downstream Adoption Guide](./downstream-adoption-guide.md) for full details on each category,
greenfield and legacy migration paths, provider pattern adoption, and fleet governance.

---

## Runbooks

Runbooks are machine-readable JSON procedures in `docs/runbooks/` that codify
multi-step operations. Use `pnpm runbook <name>` to print steps, or add `--json`
for machine-readable output that AI agents can execute step-by-step.

Runbooks most relevant to consumer app developers:

| Runbook | When to use |
|---------|-------------|
| `adopt-ripple-next` | Full adoption flow: scaffold → configure → document → verify |
| `scaffold-downstream` | Bootstrap a new downstream repo with golden-path files |
| `migrate-legacy-api` | Migrate a legacy API service into ripple-next conventions |
| `run-conformance` | Check your repo's documentation compliance score |
| `fleet-feedback-submit` | Submit feedback or requests to the golden-path team |

See [Platform Capabilities — Runbooks](./platform-capabilities.md#runbooks-machine-readable) for the full inventory (13 runbooks).

---

## Related Documentation

- [Platform Developer Guide](./platform-developer-guide.md) — contributing to the ripple-next monorepo
- [Downstream Adoption Guide](./downstream-adoption-guide.md) — mandatory documentation standards for downstream repos
- [AI Adoption Prompts](./ai-adoption-prompts.md) — copy-paste prompts for AI agents
- [Platform Capabilities](./platform-capabilities.md) — inventory of packages, workflows, and tools
- [Provider Pattern](./provider-pattern.md) — core infrastructure abstraction
- [API Contracts](./api-contracts.md) — oRPC and REST endpoints
- [Testing Guide](./testing-guide.md) — test pyramid and examples
- [ADR-007](./adr/007-library-vs-monorepo.md) — hybrid monorepo rationale
- [ADR-012](./adr/012-env-schema-validation.md) — environment variable validation gate
