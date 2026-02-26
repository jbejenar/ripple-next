# Architecture

## System Overview

Ripple Next is a full-stack government digital platform built with an AI-agent-first
architecture. Every technology choice maximizes autonomous agent effectiveness.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 + Vue 3 (Composition API) + TypeScript |
| UI Components | Ripple UI Core + Storybook 8 |
| API | Nitro server routes + tRPC-nuxt |
| Database | PostgreSQL (Drizzle ORM) + DynamoDB (ElectroDB) + Redis |
| Queue | SQS (prod) / BullMQ (local) / Memory (test) |
| Auth | Lucia Auth v3 + AWS Cognito |
| File Storage | S3 (prod) / MinIO (local) / fs (test) |
| Infrastructure | SST v3 (Pulumi/Terraform) |
| Compute | Lambda (default) + ECS Fargate (long-running) |
| Testing | Vitest + Vue Test Utils + Playwright + Testcontainers |

## Provider Pattern

Every infrastructure concern uses a provider interface with at least three
implementations: one for tests (memory/mock), one for local dev, one for production.

See `docs/provider-pattern.md` for details.

## Compute Decision Framework

- **Lambda** (default): Request-response, <15 min, auto-scales to zero
- **ECS Fargate**: Long-running processes, WebSockets, batch jobs
- **Never EKS**: Too complex for agent-first development

## Deployment

- Preview per PR: `npx sst deploy --stage pr-123`
- Staging: auto-deploy on main merge
- Production: manual approval gate

See `docs/deployment.md` for details.
