# Project: Ripple Next

## Overview
A full-stack government digital platform built with Nuxt 3, Ripple UI,
and TypeScript. Deployed to AWS via SST v3 (Pulumi — NOT CDK/CloudFormation).
Port of the Victorian government Ripple design system to an AI-agent-first architecture.

## Tech Stack
- Frontend: Nuxt 3 + Vue 3 Composition API + TypeScript
- UI: Ripple UI Core (forked), UnoCSS, Storybook 8
- API: Nitro server routes + tRPC-nuxt
- DB: PostgreSQL (Drizzle ORM), DynamoDB (ElectroDB), Redis
- Queue: SQS (prod) / BullMQ (local) / Memory (test)
- Auth: Lucia Auth v3 + Cognito
- Infra: SST v3 (Pulumi/Terraform) — NOT CDK, NOT CloudFormation
- Compute: Lambda (default) + ECS Fargate (long-running only)
- Testing: Vitest, Vue Test Utils, Playwright, Testcontainers

## Critical Architecture Patterns

### Provider Pattern
Every infrastructure concern uses a provider interface:
- `packages/queue/providers/` → memory.ts | bullmq.ts | sqs.ts
- `packages/auth/providers/` → mock.ts | lucia.ts | cognito.ts
- `packages/storage/providers/` → filesystem.ts | minio.ts | s3.ts
- `packages/email/providers/` → smtp.ts (includes MemoryEmailProvider) | ses.ts
Tests ALWAYS use memory/mock providers. Never depend on cloud services.

### Lambda-First Compute
- Default: Lambda via Nitro (request-response, <15 min)
- Escape hatch: ECS Fargate (long-running, WebSocket, batch)
- Never: EKS/Kubernetes
- SST handles all wiring — `sst.aws.Nuxt`, `queue.subscribe()`, `sst.aws.Cron`

### SST Resource Linking
In production, access infrastructure via SST's `Resource` object:
```ts
import { Resource } from "sst"
// Resource.Database.connectionString, Resource.EmailQueue.url, etc.
```
In tests, use mock providers. In local dev, use docker-compose services.

## Commands
- `pnpm install` — Install all dependencies
- `pnpm dev` — Start Nuxt dev + docker-compose services
- `pnpm build` — Build all packages and apps
- `pnpm test` — Run all Vitest tests (unit + integration)
- `pnpm test:e2e` — Run Playwright E2E tests
- `pnpm test:ui` — Run Storybook component tests
- `pnpm lint` — ESLint + Stylelint + Prettier check
- `pnpm lint:fix` — Auto-fix lint issues
- `pnpm typecheck` — TypeScript type checking (tsc --noEmit)
- `pnpm db:generate` — Generate Drizzle migration from schema changes
- `pnpm db:migrate` — Run pending migrations
- `pnpm db:seed` — Seed development data
- `pnpm db:studio` — Open Drizzle Studio (DB browser)
- `pnpm storybook` — Start Storybook dev server
- `npx sst dev` — Start SST live dev (deploys to AWS, proxies locally)
- `npx sst deploy --stage staging` — Deploy to staging
- `npx sst deploy --stage production` — Deploy to production

## Code Conventions
- All components use `<script setup lang="ts">` (Composition API only)
- UI components follow atomic design: atoms → molecules → organisms
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
- Every new API endpoint needs: integration test with real DB (testcontainers)
- Every new component needs: component test with Vue Test Utils
- Every Lambda handler needs: unit test with mock providers
- Use factories from `packages/testing/factories/` for test data
- Use mock providers from `packages/testing/mocks/providers.ts`
- Always run `pnpm test` and `pnpm typecheck` before considering work done

## Infrastructure Changes
- All infra is in `sst.config.ts` (TypeScript, NOT YAML, NOT CloudFormation)
- Lambda is the default compute — use `queue.subscribe()` or `sst.aws.Cron`
- Only use ECS Fargate for jobs >15min or WebSocket services
- Use SST `link` to pass resources to functions — never hardcode ARNs or URLs
- Test infra changes with `npx sst deploy --stage pr-123` (isolated per PR)

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
packages/ui/       — Ripple-based UI component library
packages/db/       — Database layer (Drizzle + Postgres)
packages/queue/    — Queue abstraction (provider pattern)
packages/auth/     — Authentication package
packages/storage/  — File storage abstraction
packages/email/    — Email abstraction
packages/events/   — Domain event bus
packages/validation/ — Shared Zod validation schemas
packages/shared/   — Shared types and utilities
packages/testing/  — Shared test infrastructure
services/worker/   — Queue consumer service (Lambda + ECS)
services/websocket/ — WebSocket service (ECS Fargate)
services/cron/     — Cron job handlers (Lambda)
services/events/   — EventBridge event handlers (Lambda)
```
