# ADR-023: Downstream Adoption Standards — Documentation Governance for Fleet Consumers

## Status

Accepted

## Date

2026-03-01

## Deciders

Architecture team, AI agents (Claude Code)

## Context

Fleet governance ([ADR-019](./019-fleet-governance.md)) enforces CI workflows, toolchain
pinning, quality scripts, ESLint config, security config, IaC policies, error taxonomy,
and AI agent instructions across downstream repos — 11 governed surfaces in total.
Bidirectional fleet communication ([ADR-022](./022-bidirectional-fleet-communication.md))
enables downstream feedback, version tracking, and update notifications.

However, **zero enforcement exists for what downstream repos actually build and document.**
The conformance rubric checks that `README.md`, `CLAUDE.md`, and `readiness.json` exist,
but not whether they contain meaningful content. The scaffolded product roadmap is
placeholder checkboxes. No architecture documentation template exists. No API contract
template exists.

### Triggering incident

An AI agent (GitHub Copilot) was tasked with migrating Mule 3 APIs into a ripple-next
downstream repo. The agent:

1. Built a standalone project (its own `package.json`, `src/` directory, `vitest.config.ts`)
   instead of integrating into the ripple-next ecosystem
2. Skipped all planning and documentation artifacts
3. Ignored ripple-next conventions (provider pattern, fleet governance, conformance)
4. Produced no product roadmap, no architecture documentation, no API contracts

**Root cause:** ripple-next had no machine-readable guidance for what downstream repos
must produce. The agent had no deterministic instructions to follow.

### Problem scope

Without adoption standards, downstream repos can:

- Pass conformance scoring with empty placeholder content
- Ship without documenting what they build or why
- Ignore the provider pattern and fleet governance
- Produce standalone projects that don't integrate with the golden path

AI agents are the primary consumers of these standards. They need deterministic,
step-by-step guidance — not just existence checks.

## Decision

### 1. Downstream Adoption Guide

Create a comprehensive guide at `docs/downstream-adoption-guide.md` that defines:

- **7 mandatory documentation categories** that every downstream repo must produce:
  product roadmap, architecture, API contracts (if applicable), ADRs, readiness
  manifest, README, and CLAUDE.md
- **Greenfield adoption path** — step-by-step from scaffold to deployment
- **Legacy migration path** — phased methodology from analysis to parity verification
- **Content requirements** — not just file existence, but structure and substance

The guide is designed for AI agent consumption first, human consumption second.

### 2. Platform Capabilities Catalog

Create `docs/platform-capabilities.md` as the authoritative inventory of what
ripple-next provides to downstream consumers: packages, workflows, governance,
generators, runbooks, conformance tooling, error taxonomy, architecture patterns.

### 3. Documentation Quality Standards (Advisory)

Add conformance checks beyond file-exists:

- Product roadmap exists with meaningful structure (not placeholder checkboxes)
- Architecture documentation exists with system overview
- API contract documentation exists (for repos with API endpoints)

New conformance category: `downstream-docs` (10 points, 3 checks).

### 4. Advisory Fleet Surfaces

Add two new governed surfaces to `fleet-policy.json`:

- **FLEET-SURF-012** (`downstream-documentation`): advisory surface for product
  roadmap structure, architecture docs, and readiness content quality
- **FLEET-SURF-013** (`api-contract-documentation`): advisory surface for API
  contract documentation

Both use `"strategy": "advisory"`, `"severity": "recommended"` — report only,
don't break builds. Can be promoted to `standards-required` after fleet adoption.

### 5. Machine-Readable Runbooks

Two new runbooks for structured, repeatable adoption and migration:

- `adopt-ripple-next.json` — full adoption flow from scaffold to conformance
- `migrate-legacy-api.json` — legacy API migration methodology

### 6. Enhanced Scaffolding

Replace placeholder scaffold templates with meaningful starting points:

- Product roadmap: Now/Next/Later structure with numbered items
- Architecture documentation: system overview, stack table, provider decisions
- API contract documentation: endpoint table, OpenAPI pipeline

### 7. Error Taxonomy

Add `RPL-ADOPT-*` codes for documentation governance failures (advisory, non-blocking).

## Rationale

- **Advisory-first enforcement** matches the fleet governance maturity model
  ([ADR-019](./019-fleet-governance.md)). Start with reporting, promote to
  standards-required once downstream repos demonstrate adoption.

- **AI agents are primary consumers.** Machine-readable runbooks, structured
  templates, and deterministic guidance eliminate the failure mode where agents
  build standalone projects ignoring conventions.

- **The adoption guide fills a critical gap.** `downstream-workflows.md` covers
  CI consumption. `developer-guide.md` covers consumer app setup. Neither tells
  downstream repos what **documentation** to produce.

- **Content quality matters.** File-exists checks are necessary but insufficient.
  A repo with placeholder checkboxes in its roadmap and an empty readiness manifest
  technically passes conformance but provides no value.

## Consequences

### Positive

- AI agents have deterministic guidance for downstream repo creation and migration
- Documentation quality is measurable and trackable across the fleet
- Scaffolded repos start with meaningful templates instead of placeholders
- Legacy migration has a structured, repeatable methodology
- Platform capabilities are discoverable via a single catalog document

### Negative

- Additional conformance checks require maintenance as standards evolve
- Advisory surfaces add fleet policy complexity (2 new surfaces, now 13 total)
- Enhanced scaffold templates are opinionated — downstream teams may need to
  customize heavily for non-standard architectures

### Risks

- **AI agents may still ignore the adoption guide.** Mitigated by CLAUDE.md routing
  (AGENTS.md task routing table), conformance scoring incentives, and advisory
  fleet drift reporting.
- **Over-prescriptive templates may stifle creativity.** Mitigated by using TODO
  markers, advisory (not blocking) enforcement, and clear "Deviations from Golden
  Path" sections in templates.

## Related

- [ADR-018: AI-First Workflow Strategy](./018-ai-first-workflow-strategy.md)
- [ADR-019: Fleet Governance](./019-fleet-governance.md)
- [ADR-022: Bidirectional Fleet Communication](./022-bidirectional-fleet-communication.md)
- [ADR-020: Context File Minimalism](./020-context-file-minimalism.md)
- [ADR-021: API Contract Strategy](./021-api-contract-strategy.md)
- [RN-054: Downstream Proof-of-Life](../product-roadmap/README.md#rn-054-downstream-proof-of-life--first-consumer-deployment)
- [RN-061: Downstream Adoption Documentation Standards](../product-roadmap/README.md#rn-061-downstream-adoption-documentation-standards)
