# Architecture Decision Records (ADRs)

> An ADR captures a significant architectural decision along with its context and
> consequences. ADRs are numbered sequentially and never deleted — superseded
> decisions are marked as such.

## Index

| # | Title | Status | Category |
|---|-------|--------|----------|
| [001](./001-nuxt-over-next.md) | Nuxt 3 over Next.js | Accepted | Frontend |
| [002](./002-drizzle-over-prisma.md) | Drizzle ORM over Prisma | Accepted | Database |
| [003](./003-provider-pattern.md) | Provider Pattern for Infrastructure Concerns | Accepted | Architecture |
| [004](./004-sst-over-cdk.md) | SST v3 over CDK/CloudFormation | Accepted | Infrastructure |
| [005](./005-lambda-default-ecs-escape.md) | Lambda by Default, ECS Fargate as Escape Hatch | Accepted | Compute |
| [006](./006-no-kubernetes.md) | No Kubernetes (EKS) | Accepted | Compute |
| [007](./007-library-vs-monorepo.md) | Keep Monorepo, Publish Shared Packages as Libraries | Accepted | Architecture |
| [008](./008-oidc-over-lucia.md) | Replace Lucia Auth with Standard OIDC/OAuth | Accepted | Auth |
| [009](./009-cms-provider-drupal.md) | CMS Provider Pattern for Drupal/Tide Integration | Accepted | CMS |
| [010](./010-ci-observability-supply-chain.md) | CI Observability and Supply-Chain Provenance | Accepted | CI/CD |
| [011](./011-cms-decoupling-pull-out-drupal.md) | CMS Decoupling — "Pull Out Drupal" Architecture | Accepted | CMS |
| [012](./012-env-schema-validation.md) | Environment Schema Validation Gate | Accepted | CI/CD |
| [013](./013-flaky-test-containment.md) | Flaky Test Containment Policy | Accepted | Testing |
| [014](./014-preview-deploy-guardrails.md) | Preview Deploy Environment Guardrails | Accepted | Deployment |
| [015](./015-localstack-assessment.md) | LocalStack Assessment — Provider Pattern over Emulation | Accepted | Infrastructure |
| [016](./016-roadmap-reorganisation.md) | Roadmap Reorganisation — AI-First Priority Tiers and Suggestion Governance | Accepted | Process |
| [017](./017-upstream-ripple-component-strategy.md) | Upstream Ripple Component Strategy — Port, Own, Selectively Sync | Accepted | Frontend |
| [018](./018-ai-first-workflow-strategy.md) | AI-First Workflow Strategy — Runbooks, Generators, Error Taxonomy | Accepted | Process |
| [019](./019-fleet-governance.md) | Fleet Governance — Template Drift Detection and Sync Automation | Accepted | Process |
| [020](./020-context-file-minimalism.md) | Context File Minimalism — Evidence-Based Agent Doc Trimming | Accepted | Process |

## Categories

### Architecture (Core Patterns)
- **ADR-003** — Provider pattern used by all infrastructure concerns
- **ADR-007** — Hybrid monorepo: develop together, publish independently

### Frontend
- **ADR-001** — Nuxt 3 chosen over Next.js for Vue ecosystem alignment
- **ADR-017** — Upstream Ripple 2 components: port, own, selectively sync (no runtime dependency)

### Database
- **ADR-002** — Drizzle ORM chosen over Prisma for type safety and migration control

### Auth
- **ADR-008** — Standard OIDC/OAuth via `oauth4webapi` replaces deprecated Lucia

### CMS
- **ADR-009** — CMS provider pattern with Drupal/Tide JSON:API integration
- **ADR-011** — Drupal isolated to 2 files; removable without touching frontend/tests

### Infrastructure & Compute
- **ADR-004** — SST v3 (Pulumi) chosen over CDK/CloudFormation
- **ADR-005** — Lambda as default compute; ECS Fargate as documented escape hatch
- **ADR-006** — EKS/Kubernetes explicitly rejected
- **ADR-015** — LocalStack optional only; provider pattern preferred for local dev

### CI/CD & Testing
- **ADR-010** — Structured test artifacts, SBOM, provenance, reusable actions
- **ADR-012** — Zod-based environment schema validation in CI
- **ADR-013** — Flaky test quarantine policy with time box and budget cap
- **ADR-014** — Preview deploy environment protection and label-gated deployment

### Process
- **ADR-016** — Roadmap reorganisation with AI-first priority tiers and suggestion governance
- **ADR-018** — AI-first workflow strategy: runbooks, generators, error taxonomy
- **ADR-019** — Fleet governance: template drift detection, sync PRs, compliance reporting
- **ADR-020** — Context file minimalism: trim CLAUDE.md/AGENTS.md based on empirical evidence (arXiv:2602.11988)

## Conventions

- **Numbering:** Sequential, zero-padded to 3 digits (`001`, `002`, ..., `020`)
- **Status values:** `Proposed` → `Accepted` → `Superseded` (or `Deprecated`)
- **File naming:** `{number}-{slug}.md` (e.g., `003-provider-pattern.md`)
- **Immutability:** Once accepted, an ADR is never modified. Create a new ADR that
  supersedes it if the decision changes.
