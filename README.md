# Ripple Next

AI-agent-first government digital platform built with Nuxt 3, Ripple UI, and TypeScript.
Port of the Victorian government [Ripple design system](https://github.com/dpc-sdp/ripple) to a modern, full-stack architecture optimized for AI coding agents.

## Quick Start

```bash
# One-command setup (install + doctor + validate)
pnpm bootstrap

# Start local services (Postgres, Redis, MinIO, Mailpit, MeiliSearch)
docker compose up -d

# Copy env template and run migrations
cp .env.example .env
pnpm db:migrate && pnpm db:seed

# Start development server
pnpm dev
```

## Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | Nuxt 3 + Vue 3 + TypeScript   |
| UI       | Ripple UI Core + Storybook 10 |
| API      | Nitro server routes + oRPC (OpenAPI 3.1.1) |
| Database | PostgreSQL (Drizzle ORM)      |
| CMS      | Drupal/Tide (JSON:API) / Mock |
| Queue    | SQS / BullMQ / Memory         |
| Auth     | OIDC/OAuth (oauth4webapi)     |
| Infra    | SST v3 (Pulumi)               |
| Compute  | Lambda + ECS Fargate          |
| Testing  | Vitest + Playwright           |

## Commands

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `pnpm bootstrap`       | First-time setup (all-in-one)  |
| `pnpm doctor`          | Validate environment readiness |
| `pnpm dev`             | Start dev server               |
| `pnpm build`           | Build all packages             |
| `pnpm test`            | Run all tests                  |
| `pnpm test:e2e`        | Run E2E tests                  |
| `pnpm lint`            | Lint all code                  |
| `pnpm typecheck`       | Type check                     |
| `pnpm db:generate`     | Generate migration             |
| `pnpm db:migrate`      | Run migrations                 |
| `pnpm db:seed`         | Seed dev data                  |
| `pnpm storybook`       | Start Storybook                |
| `pnpm storybook:build` | Build Storybook                |
| `pnpm generate:scaffold <dir>` | Scaffold a downstream repo with full DX infrastructure |
| `pnpm conform`         | Score a repo against the golden-path conformance rubric |

## Documentation

> **AI agents:** start with [AGENTS.md](AGENTS.md). **Developers:** start with the [Developer Guide](docs/developer-guide.md). **Downstream consumers:** see [Platform Capabilities](docs/platform-capabilities.md).

### Start Here

| Document | Description |
| --- | --- |
| [AGENTS.md](AGENTS.md) | **AI agents start here** — conventions, patterns, task routing |
| [Developer Guide](docs/developer-guide.md) | **Developers start here** — bare Mac to deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and upstream Ripple sync procedure |

### Architecture & Design

| Document | Description |
| --- | --- |
| [Architecture](docs/architecture.md) | System overview, stack, and high-level design |
| [Provider Pattern](docs/provider-pattern.md) | Core pattern for environment-swappable infrastructure |
| [Data Model](docs/data-model.md) | PostgreSQL schema and entity relationships |
| [API Contracts](docs/api-contracts.md) | oRPC routers and REST endpoints |
| [Lambda vs ECS](docs/lambda-vs-ecs.md) | Compute decision framework |
| [Critique Evaluation](docs/critique-evaluation.md) | Architecture review decisions |

### Operations & Quality

| Document | Description |
| --- | --- |
| [Deployment Guide](docs/deployment.md) | Local dev, preview, staging, and production |
| [Testing Guide](docs/testing-guide.md) | Test pyramid, examples, and mock providers |
| [CI Gates](docs/ci-gates.md) | Blocking vs advisory CI gate classification |
| [Accessibility](docs/accessibility.md) | WCAG 2.1 AA compliance audit pipeline |
| [Performance](docs/performance.md) | Core Web Vitals budgets and audit pipeline |
| [Release Verification](docs/release-verification.md) | Checksums, SBOM, and build provenance |
| [Session Observability](docs/session-observability.md) | AI agent session metrics and friction tracking |
| [Runbooks](docs/runbooks/) | Machine-readable procedures (deploy, rollback, scaffold, adopt, migrate) |

### Platform & Ecosystem

| Document | Description |
| --- | --- |
| [Platform Capabilities](docs/platform-capabilities.md) | What ripple-next provides to consumers |
| [Downstream Workflows](docs/downstream-workflows.md) | Consuming reusable CI composite actions |
| [Downstream Adoption Guide](docs/downstream-adoption-guide.md) | Documentation standards for downstream repos |
| [Product Roadmap](docs/product-roadmap/) | Platform roadmap, priorities, and archive |

> Domain-specific instructions for frontend, API, database, testing, and infrastructure are auto-loaded from [`.github/instructions/`](.github/instructions/) by supported tools.

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
| [ADR-008](docs/adr/008-oidc-over-lucia.md)           | OIDC/OAuth over deprecated Lucia     |
| [ADR-009](docs/adr/009-cms-provider-drupal.md)       | CMS provider pattern for Drupal/Tide |
| [ADR-010](docs/adr/010-ci-observability-supply-chain.md) | CI observability + supply chain  |
| [ADR-011](docs/adr/011-cms-decoupling-pull-out-drupal.md) | CMS decoupling — pull out Drupal |
| [ADR-012](docs/adr/012-env-schema-validation.md)         | Env schema validation gate       |
| [ADR-013](docs/adr/013-flaky-test-containment.md)        | Flaky test containment policy    |
| [ADR-014](docs/adr/014-preview-deploy-guardrails.md)     | Preview deploy guardrails        |
| [ADR-015](docs/adr/015-localstack-assessment.md)         | LocalStack — provider pattern preferred |
| [ADR-016](docs/adr/016-roadmap-reorganisation.md)        | Roadmap reorganisation — AI-first priority tiers |
| [ADR-017](docs/adr/017-upstream-ripple-component-strategy.md) | Upstream Ripple — port, own, selectively sync |
| [ADR-018](docs/adr/018-ai-first-workflow-strategy.md) | AI-first workflow — runbooks, generators, error taxonomy |
| [ADR-019](docs/adr/019-fleet-governance.md) | Fleet governance — drift detection + sync automation |
| [ADR-020](docs/adr/020-context-file-minimalism.md) | Context file minimalism — evidence-based line limits |
| [ADR-021](docs/adr/021-api-contract-strategy.md) | API contract strategy — oRPC + OpenAPI-first |
| [ADR-022](docs/adr/022-bidirectional-fleet-communication.md) | Bidirectional fleet communication |
| [ADR-023](docs/adr/023-downstream-adoption-standards.md) | Downstream adoption standards — documentation governance |

## Repository Structure

```
apps/web/            — Nuxt 3 application
packages/ui/         — Ripple UI component library
packages/db/         — Database (Drizzle ORM)
packages/cms/        — CMS abstraction (Drupal/Tide + Mock)
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

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

Free to use for personal, academic, research, and other noncommercial purposes. Commercial use requires a separate license — contact the maintainers for details.
