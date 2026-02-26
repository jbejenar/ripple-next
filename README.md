# Ripple Next

AI-agent-first government digital platform built with Nuxt 3, Ripple UI, and TypeScript.
Port of the Victorian government [Ripple design system](https://github.com/dpc-sdp/ripple) to a modern, full-stack architecture optimized for AI coding agents.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local services (Postgres, Redis, MinIO, Mailpit, MeiliSearch)
docker compose up -d

# Run migrations and seed
pnpm db:migrate && pnpm db:seed

# Start development server
pnpm dev
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 + Vue 3 + TypeScript |
| UI | Ripple UI Core + Storybook 8 |
| API | Nitro server routes + tRPC |
| Database | PostgreSQL (Drizzle ORM) |
| Queue | SQS / BullMQ / Memory |
| Auth | Lucia Auth v3 |
| Infra | SST v3 (Pulumi) |
| Compute | Lambda + ECS Fargate |
| Testing | Vitest + Playwright |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lint` | Lint all code |
| `pnpm typecheck` | Type check |
| `pnpm db:generate` | Generate migration |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:seed` | Seed dev data |
| `pnpm storybook` | Start Storybook |

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full architecture overview.

## Repository Structure

```
apps/web/           — Nuxt 3 application
packages/ui/        — Ripple UI component library
packages/db/        — Database (Drizzle ORM)
packages/queue/     — Queue abstraction
packages/auth/      — Authentication
packages/storage/   — File storage
packages/email/     — Email
packages/events/    — Domain events
packages/validation/ — Zod schemas
packages/shared/    — Shared types/utils
packages/testing/   — Test infrastructure
services/worker/    — Queue consumers
services/websocket/ — WebSocket service
services/cron/      — Cron jobs
services/events/    — Event handlers
```

## License

Apache-2.0
