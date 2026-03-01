# Platform Capabilities

> What ripple-next provides to downstream consumers.
>
> This is the authoritative inventory of published packages, reusable workflows,
> governance tooling, and generators. For how to adopt them, see the
> [Downstream Adoption Guide](./downstream-adoption-guide.md).

---

## Published Packages (`@ripple-next/*`)

All packages are published to a private npm registry. Consumer repos install them
like any other dependency and upgrade on their own schedule ([ADR-007](./adr/007-library-vs-monorepo.md)).

| Package | Purpose | Provider Pattern | Maturity |
|---------|---------|-----------------|----------|
| `@ripple-next/auth` | OIDC/OAuth authentication (oauth4webapi) | MockAuthProvider / OidcAuthProvider | integration-tested |
| `@ripple-next/db` | PostgreSQL via Drizzle ORM + repository pattern | N/A (direct) | integration-tested |
| `@ripple-next/queue` | Job processing with DLQ retry | MemoryQueueProvider / BullMQQueueProvider / SqsQueueProvider | conformance-tested |
| `@ripple-next/storage` | File storage with presigned URLs | FilesystemStorageProvider / MinioStorageProvider / S3StorageProvider | conformance-tested |
| `@ripple-next/email` | Email delivery | MemoryEmailProvider / SmtpEmailProvider / SesEmailProvider | conformance-tested |
| `@ripple-next/events` | Domain event bus | MemoryEventBus / EventBridgeBus | conformance-tested |
| `@ripple-next/cms` | Content management (Drupal decoupled) | MockCmsProvider / DrupalCmsProvider | conformance-tested |
| `@ripple-next/ui` | Vue 3 component library (44 components, Ripple design system) | N/A | conformance-tested |
| `@ripple-next/validation` | Shared Zod schemas (frontend + backend) | N/A | conformance-tested |
| `@ripple-next/shared` | Shared types and utilities | N/A | conformance-tested |
| `@ripple-next/testing` | Test utilities, factories, mock providers, conformance suites | N/A | conformance-tested |

**Maturity levels:** `interface-defined` → `conformance-tested` → `integration-tested` → `production-proven`. See [`readiness.json`](./readiness.json) for per-subsystem detail.

**Coverage thresholds** (enforced, never lowered):

| Tier | Packages | Lines/Functions | Branches |
|------|----------|----------------|----------|
| Tier 1 (Critical) | auth, db, queue | 60% | 50% |
| Tier 2 (Infrastructure) | cms, email, storage, events, validation | 40% | 30% |
| Tier 3 (UI/Services) | ui, testing | 20% | 10% |

---

## Reusable CI Workflows

Full workflow pipelines that downstream repos call with `uses:`. Handle the entire
job including runner setup, service containers, and artifact uploads.

| Workflow | Purpose | Key Features |
|----------|---------|--------------|
| `reusable-quality.yml` | Lint, typecheck, policy gates | Readiness drift, quarantine check, optional IaC scan |
| `reusable-test.yml` | Test execution + services | PostgreSQL + Redis containers, coverage, JUnit artifacts |
| `reusable-security.yml` | CodeQL + dependency review + secret audit | Configurable severity thresholds |

See [Downstream Workflows](./downstream-workflows.md) for full reference including inputs, outputs, and examples.

---

## Composite Actions

Lower-level building blocks for custom workflow composition in `.github/actions/`:

| Action | Purpose | Key Features |
|--------|---------|--------------|
| `setup` | Node.js + pnpm installation | Frozen lockfile, pnpm + Turbo caching, optional registry URL |
| `quality` | Lint, typecheck, policy gates | Readiness drift guard, quarantine check |
| `test` | Test execution + artifact upload | JUnit XML, coverage reports, 30-day retention |
| `fleet-drift` | Fleet governance drift detection | Checks all governed surfaces, outputs compliance report |
| `fleet-feedback` | Submit feedback to golden path | Structured feedback with auto-PR for improvement shares |

---

## Fleet Governance

13 governed surfaces across 3 severity levels, designed for downstream repos to
stay synchronised with the golden path ([ADR-019](./adr/019-fleet-governance.md)).

| Surface | Strategy | Severity | What It Governs |
|---------|----------|----------|-----------------|
| FLEET-SURF-001 | sync | standards-required | CI workflows |
| FLEET-SURF-002 | sync | security-critical | Composite actions |
| FLEET-SURF-003 | sync | security-critical | Toolchain pinning (.nvmrc, engines) |
| FLEET-SURF-004 | sync | standards-required | Quality gate scripts |
| FLEET-SURF-005 | merge | standards-required | ESLint config |
| FLEET-SURF-006 | sync | security-critical | Security config + CODEOWNERS |
| FLEET-SURF-007 | sync | security-critical | IaC policies |
| FLEET-SURF-008 | sync | standards-required | Error taxonomy |
| FLEET-SURF-009 | advisory | recommended | Action version pinning |
| FLEET-SURF-010 | advisory | recommended | AI agent instructions |
| FLEET-SURF-011 | sync | standards-required | Fleet governance tooling |
| FLEET-SURF-012 | advisory | recommended | Downstream documentation quality |
| FLEET-SURF-013 | advisory | recommended | API contract documentation |

**Sync strategies:** `sync` (exact file copy), `merge` (safe text merge), `advisory` (report only).

**Commands:**

| Task | Command |
|------|---------|
| Bootstrap downstream repo | `pnpm generate:scaffold <path> --name=<name> --org=<org>` |
| Check drift | `pnpm check:fleet-drift -- --target=<path>` |
| Preview sync | `pnpm fleet:sync -- --target=<path> --dry-run` |
| Apply sync | `pnpm fleet:sync -- --target=<path>` |
| Submit feedback | `pnpm fleet:feedback -- --type=<type> --title="..." --submit` |

See [`fleet-policy.json`](./fleet-policy.json) for the full machine-readable contract and [Downstream Workflows](./downstream-workflows.md) for operational details.

---

## Code Generators

One-command scaffolders for agents and developers:

| Generator | Command | What It Creates |
|-----------|---------|-----------------|
| Scaffold | `pnpm generate:scaffold <path>` | Full downstream DX (~35+ files): AI docs, quality gates, CI, fleet governance, documentation templates |
| Component | `pnpm generate:component <Name> --tier=<tier>` | Vue 3 component + Storybook story + Vue Test Utils test |
| Provider | `pnpm generate:provider <Name> --concern=<concern>` | Provider implementation + conformance test |
| API Endpoint | `pnpm generate:api-endpoint <Name>` | oRPC router + procedure + contract test |
| Package | `pnpm generate:package <Name>` | New monorepo package with build, test, lint config |

---

## Runbooks (Machine-Readable)

JSON procedures in `docs/runbooks/` for structured, repeatable operations:

| Runbook | Purpose |
|---------|---------|
| `adopt-ripple-next.json` | Full adoption flow: scaffold → configure → document → verify |
| `migrate-legacy-api.json` | Legacy API migration: analyze → model → contract → implement → verify parity → document |
| `add-api-endpoint.json` | Add a new oRPC endpoint with contract tests |
| `add-new-component.json` | Add a Vue component with story and tests |
| `add-new-provider.json` | Add a provider implementation with conformance tests |
| `deploy-to-staging.json` | Build, validate, and deploy to staging |
| `scaffold-downstream.json` | Bootstrap a new downstream repository |
| `onboard-new-package.json` | Add a new package to the monorepo |
| `run-conformance.json` | Run conformance scoring against a target repo |
| `fleet-feedback-intake.json` | Process incoming fleet feedback |
| `fleet-feedback-submit.json` | Submit feedback to the golden-path upstream |
| `fleet-sync.json` | Synchronise downstream repo with golden path |
| `rollback-production.json` | Rollback a production deployment |

---

## Conformance Tooling

Conformance scoring evaluates downstream repos against golden-path standards.

| Aspect | Detail |
|--------|--------|
| Command | `pnpm conform -- --target=<path> --json` |
| Schema | `ripple-conformance-rubric/v1` |
| Max score | 100 points |
| Passing threshold | 70 points |
| Categories | 8: setup, quality, CI, testing, documentation, security, fleet, downstream-docs |

See [`conformance-rubric.json`](./conformance-rubric.json) for the full machine-readable rubric.

---

## Error Taxonomy

Machine-parseable error codes for AI agent auto-triage across the fleet.

| Aspect | Detail |
|--------|--------|
| Format | `RPL-<CATEGORY>-<NNN>` |
| Total codes | 68+ |
| Categories | 19 (ENV, LINT, TYPE, TEST, BUILD, DEPLOY, POLICY, IAC, FLEET, A11Y, SESSION, SCAFFOLD, DOCS, API, AUTH, FEEDBACK, PERF, CONFORM, ADOPT) |
| Severity levels | error (blocking), warning (non-blocking), info (informational) |

Each code includes severity, category, message, remediation steps, related gate, and automatable flag.

See [`error-taxonomy.json`](./error-taxonomy.json) for the full taxonomy.

---

## Architecture Patterns

Core architectural patterns that downstream repos should follow:

| Pattern | Description | Reference |
|---------|-------------|-----------|
| Provider Pattern | Every infrastructure concern as a swappable interface (mock/local/prod) | [Provider Pattern](./provider-pattern.md), [ADR-003](./adr/003-provider-pattern.md) |
| CMS Decoupling | Drupal isolated to 2 files; removable without affecting frontend/tests | [ADR-011](./adr/011-cms-decoupling-pull-out-drupal.md) |
| Repository Pattern | All database access through typed repositories | [Data Model](./data-model.md), [ADR-002](./adr/002-drizzle-over-prisma.md) |
| Lambda-First Compute | Lambda default, ECS Fargate escape hatch, never EKS | [Lambda vs ECS](./lambda-vs-ecs.md), [ADR-005](./adr/005-lambda-default-ecs-escape.md) |
| oRPC API Contracts | OpenAPI-first contracts with drift detection | [API Contracts](./api-contracts.md), [ADR-021](./adr/021-api-contract-strategy.md) |
| SST Infrastructure | Pulumi-based IaC with Resource linking | [Deployment](./deployment.md), [ADR-004](./adr/004-sst-over-cdk.md) |

---

## Related Documentation

- [Downstream Adoption Guide](./downstream-adoption-guide.md) — how to adopt these capabilities
- [Downstream Workflows](./downstream-workflows.md) — CI consumption and fleet operations
- [Architecture](./architecture.md) — ripple-next system architecture
- [Developer Guide](./developer-guide.md) — setup, development, and deployment
- [ADR Index](./adr/README.md) — all Architecture Decision Records (23 total)
- [Product Roadmap](./product-roadmap/README.md) — platform roadmap and priorities
