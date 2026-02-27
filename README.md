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

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | Nuxt 3 + Vue 3 + TypeScript   |
| UI       | Ripple UI Core + Storybook 10 |
| API      | Nitro server routes + tRPC    |
| Database | PostgreSQL (Drizzle ORM)      |
| Queue    | SQS / BullMQ / Memory         |
| Auth     | Lucia Auth v3                 |
| Infra    | SST v3 (Pulumi)               |
| Compute  | Lambda + ECS Fargate          |
| Testing  | Vitest + Playwright           |

## Commands

| Command                | Description        |
| ---------------------- | ------------------ |
| `pnpm dev`             | Start dev server   |
| `pnpm build`           | Build all packages |
| `pnpm test`            | Run all tests      |
| `pnpm test:e2e`        | Run E2E tests      |
| `pnpm lint`            | Lint all code      |
| `pnpm typecheck`       | Type check         |
| `pnpm db:generate`     | Generate migration |
| `pnpm db:migrate`      | Run migrations     |
| `pnpm db:seed`         | Seed dev data      |
| `pnpm storybook`       | Start Storybook    |
| `pnpm storybook:build` | Build Storybook    |

## Documentation

| Document                                           | Description                                           |
| -------------------------------------------------- | ----------------------------------------------------- |
| [Architecture](docs/architecture.md)               | System overview, stack, and high-level design         |
| [Provider Pattern](docs/provider-pattern.md)       | Core pattern for environment-swappable infrastructure |
| [Data Model](docs/data-model.md)                   | PostgreSQL schema and entity relationships            |
| [API Contracts](docs/api-contracts.md)             | tRPC routers and REST endpoints                       |
| [Deployment Guide](docs/deployment.md)             | Local dev, preview, staging, and production           |
| [Testing Guide](docs/testing-guide.md)             | Test pyramid, examples, and mock providers            |
| [Lambda vs ECS](docs/lambda-vs-ecs.md)             | Compute decision framework                            |
| [Critique Evaluation](docs/critique-evaluation.md) | Architecture review decisions                         |
| [AGENTS.md](AGENTS.md)                             | AI agent conventions and code guidelines              |

### Architecture Decision Records

| ADR                                                  | Decision                             |
| ---------------------------------------------------- | ------------------------------------ |
| [ADR-001](docs/adr/001-nuxt-over-next.md)            | Nuxt 3 over Next.js                  |
| [ADR-002](docs/adr/002-drizzle-over-prisma.md)       | Drizzle ORM over Prisma              |
| [ADR-003](docs/adr/003-provider-pattern.md)          | Provider pattern for infrastructure  |
| [ADR-004](docs/adr/004-sst-over-cdk.md)              | SST v3 over CDK/CloudFormation       |
| [ADR-005](docs/adr/005-lambda-default-ecs-escape.md) | Lambda default, ECS escape hatch     |
| [ADR-006](docs/adr/006-no-kubernetes.md)             | No Kubernetes                        |
| [ADR-007](docs/adr/007-library-vs-monorepo.md)       | Hybrid monorepo + published packages |

## Repository Structure

```
apps/web/            — Nuxt 3 application
packages/ui/         — Ripple UI component library
packages/db/         — Database (Drizzle ORM)
packages/queue/      — Queue abstraction
packages/auth/       — Authentication
packages/storage/    — File storage
packages/email/      — Email
packages/events/     — Domain events
packages/validation/ — Zod schemas
packages/shared/     — Shared types/utils
packages/testing/    — Test infrastructure
services/worker/     — Queue consumers
services/websocket/  — WebSocket service
services/cron/       — Cron jobs
services/events/     — Event handlers
```

## License

Apache-2.0
