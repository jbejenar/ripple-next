# Architecture

## System Overview

Ripple Next is a full-stack government digital platform built with an AI-agent-first
architecture. Every technology choice maximizes autonomous agent effectiveness.

```mermaid
graph TB
    subgraph Client
        Browser[Browser]
    end

    subgraph "Nuxt 3 Application"
        SSR[Nuxt SSR / Nitro]
        tRPC[tRPC Router]
        Pages[Vue 3 Pages]
    end

    subgraph "Infrastructure Providers"
        Auth[Auth Provider]
        CMS[CMS Provider]
        Queue[Queue Provider]
        Storage[Storage Provider]
        Email[Email Provider]
        Events[Event Bus]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis)]
        DynamoDB[(DynamoDB)]
    end

    subgraph "Background Services"
        Worker[Worker Service]
        Cron[Cron Jobs]
        WS[WebSocket Service]
        EventHandlers[Event Handlers]
    end

    Browser --> SSR
    SSR --> tRPC
    SSR --> Pages
    tRPC --> Auth
    SSR --> CMS
    tRPC --> PG
    tRPC --> Redis
    Queue --> Worker
    Events --> EventHandlers
    Worker --> Email
    Worker --> Storage
    Cron --> PG
    WS --> Redis
```

## Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | Nuxt 3 + Vue 3 (Composition API) + TypeScript           |
| UI Components  | Ripple UI Core + Storybook 10                           |
| API            | Nitro server routes + tRPC-nuxt                         |
| Database       | PostgreSQL (Drizzle ORM) + DynamoDB (ElectroDB) + Redis |
| Queue          | SQS (prod) / BullMQ (local) / Memory (test)             |
| Auth           | OIDC/OAuth (oauth4webapi) — provider-agnostic           |
| CMS            | Drupal/Tide JSON:API (prod) / Mock (test) — decoupled, removable (ADR-011) |
| File Storage   | S3 (prod) / MinIO (local) / fs (test)                   |
| Infrastructure | SST v3 (Pulumi/Terraform)                               |
| Compute        | Lambda (default) + ECS Fargate (long-running)           |
| Testing        | Vitest + Vue Test Utils + Playwright + Testcontainers   |

## Provider Pattern

Every infrastructure concern uses a provider interface with at least three
implementations: one for tests (memory/mock), one for local dev, one for production.

The CMS provider has an explicit **decoupling architecture**: Drupal-specific code
is isolated to exactly 2 files (`drupal.ts` + `tide-paragraph-mapper.ts`), making
Drupal removable without affecting frontend, tests, or API layer. A provider factory
with dynamic imports ensures Drupal code is tree-shakeable and only loaded when needed.

See [Provider Pattern](./provider-pattern.md) for details, [ADR-003](./adr/003-provider-pattern.md) for the rationale, and [ADR-011](./adr/011-cms-decoupling-pull-out-drupal.md) for CMS decoupling.

## Compute Decision Framework

```mermaid
flowchart TD
    Start{New workload?} --> Q1{Duration > 15 min?}
    Q1 -->|Yes| ECS[ECS Fargate]
    Q1 -->|No| Q2{Persistent connections?}
    Q2 -->|Yes| ECS
    Q2 -->|No| Q3{Batch processing?}
    Q3 -->|Yes| ECS
    Q3 -->|No| Lambda[Lambda]
    Lambda --> SST["SST handles wiring automatically"]
    ECS --> Docker["Add Dockerfile + sst.aws.Cluster"]
```

- **Lambda** (default): Request-response, <15 min, auto-scales to zero
- **ECS Fargate**: Long-running processes, WebSockets, batch jobs
- **Never EKS**: Too complex for agent-first development

See [Lambda vs ECS](./lambda-vs-ecs.md) for the full decision guide, and [ADR-005](./adr/005-lambda-default-ecs-escape.md) / [ADR-006](./adr/006-no-kubernetes.md) for the rationale.

## Deployment

- Preview per PR: `npx sst deploy --stage pr-123`
- Staging: auto-deploy on main merge
- Production: manual approval gate

See [Deployment Guide](./deployment.md) for details, and [ADR-004](./adr/004-sst-over-cdk.md) for why SST.

## CI Observability and Supply-Chain Security

The CI pipeline provides structured observability and supply-chain security:

- **Test artifacts** — JUnit XML reports uploaded on every CI run (30-day retention)
- **Coverage reports** — Available as downloadable artifacts
- **Playwright traces** — Uploaded on E2E failure (7-day retention)
- **SBOM** — CycloneDX SBOM mandatory (fail-fast) on every release (90-day retention)
- **Build provenance** — Attestations via `actions/attest-build-provenance`
- **Reusable actions** — `.github/actions/{setup,quality,test}` for fleet consistency
- **Env schema validation** — Zod-based validation of required/optional env vars in CI quality gate

See [ADR-010](./adr/010-ci-observability-supply-chain.md) and [ADR-012](./adr/012-env-schema-validation.md) for the rationale.

## Related Documentation

- [Developer Guide](./developer-guide.md) — **start here** for setup and onboarding
- [Provider Pattern](./provider-pattern.md) — core architecture pattern
- [Data Model](./data-model.md) — PostgreSQL schema
- [API Contracts](./api-contracts.md) — tRPC routers and REST endpoints
- [Deployment Guide](./deployment.md) — local dev, staging, production
- [Testing Guide](./testing-guide.md) — test pyramid and examples
- [Lambda vs ECS](./lambda-vs-ecs.md) — compute decision framework
- [Critique Evaluation](./critique-evaluation.md) — architecture review decisions
- [ADR Index](./adr/) — all Architecture Decision Records
- [ADR-011: CMS Decoupling](./adr/011-cms-decoupling-pull-out-drupal.md) — pull-out-Drupal strategy
- [ADR-012: Env Schema Validation](./adr/012-env-schema-validation.md) — environment schema validation gate
