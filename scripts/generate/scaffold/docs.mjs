/**
 * Scaffold: Documentation structure.
 *
 * Generates starter readiness.json, error-taxonomy.json, ADR index,
 * first ADR, runbook templates, product roadmap (Now/Next/Later),
 * architecture doc, API contracts doc, and adoption guide reference.
 */
import { join } from 'node:path'
import { writeFileExternal } from '../lib.mjs'

export function scaffoldDocs(targetDir, config, options = {}) {
  const { name, org, description } = config
  const opts = { dryRun: options.dryRun, force: options.force }

  console.log('\n  Documentation')
  console.log('  ' + '─'.repeat(30))

  // ── docs/readiness.json ───────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'readiness.json'),
    JSON.stringify(
      {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: `${name} Readiness Manifest`,
        description: `Machine-readable subsystem status for agent planning. See AGENTS.md for conventions.`,
        version: '0.1.0',
        subsystems: {
          example: {
            status: 'planned',
            description:
              'TODO: Replace with your first subsystem. Status values: planned, in-progress, implemented.',
            packages: [],
            blockers: ['Not yet started'],
            testCoverage: 'none',
          },
        },
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── docs/error-taxonomy.json ──────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'error-taxonomy.json'),
    JSON.stringify(
      {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: `${name} Error Taxonomy`,
        description:
          'Machine-parseable error codes with categories and remediation paths. Format: RPL-<CATEGORY>-NNN.',
        version: '0.1.0',
        categories: {
          ENV: 'Environment and configuration errors',
          BUILD: 'Build and compilation errors',
          TEST: 'Test infrastructure errors',
          AUTH: 'Authentication and authorization errors',
          DB: 'Database errors',
          NET: 'Network and API errors',
        },
        errors: [
          {
            code: 'RPL-ENV-001',
            category: 'ENV',
            message: 'Required environment variable missing',
            severity: 'fatal',
            remediation: 'Copy .env.example to .env and fill in required values. Run pnpm validate:env.',
          },
          {
            code: 'RPL-BUILD-001',
            category: 'BUILD',
            message: 'TypeScript compilation failed',
            severity: 'fatal',
            remediation: 'Run pnpm typecheck and fix reported type errors.',
          },
          {
            code: 'RPL-TEST-001',
            category: 'TEST',
            message: 'Test suite failed',
            severity: 'error',
            remediation: 'Run pnpm test to see failing tests. Check test output for details.',
          },
        ],
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── docs/adr/README.md ────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'adr', 'README.md'),
    `# Architecture Decision Records

## Index

| # | Title | Status | Category |
|---|-------|--------|----------|
| [001](./001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | Process |

## Categories

- **Process** — How we make and record decisions
- **Architecture** — System design and structure
- **Infrastructure** — Deployment, CI/CD, observability
- **Security** — Auth, secrets, compliance

## How to Add an ADR

1. Copy the template from ADR-001
2. Use the next sequential number
3. Fill in Context, Decision, Status, and Consequences
4. Add to the index table above
5. Update \`docs/readiness.json\` if the decision affects subsystem status
`,
    targetDir,
    opts
  )

  // ── docs/adr/001-record-architecture-decisions.md ─────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'adr', '001-record-architecture-decisions.md'),
    `# ADR-001: Record Architecture Decisions

## Status

Accepted

## Context

We need to record the architectural decisions made on ${name} so that
future contributors (human and AI) can understand the rationale behind
design choices without re-discovering the context.

## Decision

We will use Architecture Decision Records (ADRs) as described by
Michael Nygard. Each ADR is a short markdown file in \`docs/adr/\`.

ADRs are numbered sequentially and are never deleted. When a decision
is superseded, the old ADR is marked as such with a link to the
replacement.

## Consequences

- All significant architecture decisions will be documented
- AI agents can reference ADRs when making implementation choices
- The \`docs/adr/README.md\` index provides a quick overview
- Each ADR captures context, decision, and trade-offs
`,
    targetDir,
    opts
  )

  // ── docs/runbooks/deploy-to-staging.json ──────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'runbooks', 'deploy-to-staging.json'),
    JSON.stringify(
      {
        name: 'deploy-to-staging',
        description: 'Build, validate, and deploy to the staging environment.',
        args: {},
        preconditions: [
          {
            description: 'All quality gates pass',
            command: 'pnpm verify',
            expect: 'exit 0',
          },
          {
            description: 'On a clean branch',
            command: 'test -z "$(git status --porcelain)"',
            expect: 'exit 0',
          },
        ],
        steps: [
          {
            order: 1,
            command: 'pnpm build',
            description: 'Build all packages and applications',
          },
          {
            order: 2,
            command: 'pnpm test',
            description: 'Run the full test suite',
          },
          {
            order: 3,
            command: 'echo "TODO: Add your deployment command here"',
            description: 'Deploy to staging environment',
          },
        ],
        validation: [
          {
            description: 'Staging is healthy',
            command: 'echo "TODO: Add health check command"',
            expect: 'exit 0',
          },
        ],
        postActions: [
          'Verify staging environment is accessible',
          'Run smoke tests against staging',
          'Notify team in Slack',
        ],
        related: ['scripts/verify.mjs'],
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── docs/runbooks/fleet-feedback-submit.json ─────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'runbooks', 'fleet-feedback-submit.json'),
    JSON.stringify(
      {
        name: 'fleet-feedback-submit',
        description:
          'Submit fleet feedback to the golden-path upstream repository. Supports 5 feedback types. See ADR-022.',
        args: {
          type: 'Feedback type (feature-request, bug-report, policy-exception, improvement-share, pain-point)',
          title: 'Short descriptive title',
          description: 'Detailed description',
        },
        preconditions: [
          {
            description: 'Fleet feedback script exists',
            command: 'test -f scripts/fleet-feedback.mjs',
            expect: 'exit 0',
          },
          {
            description: '.fleet.json exists',
            command: 'test -f .fleet.json',
            expect: 'exit 0',
          },
        ],
        steps: [
          {
            order: 1,
            command:
              'pnpm fleet:feedback -- --type=${TYPE} --title="${TITLE}" --description="${DESCRIPTION}" --dry-run --json',
            description: 'Preview the feedback payload (dry run)',
          },
          {
            order: 2,
            command:
              'pnpm fleet:feedback -- --type=${TYPE} --title="${TITLE}" --description="${DESCRIPTION}" --submit',
            description:
              'Submit feedback to the upstream golden-path repository',
          },
        ],
        validation: [],
        related: [
          'docs/fleet-feedback-schema.json',
          'docs/adr/022-bidirectional-fleet-communication.md',
          'scripts/fleet-feedback.mjs',
        ],
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── docs/runbooks/fleet-drift-check.json ─────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'runbooks', 'fleet-drift-check.json'),
    JSON.stringify(
      {
        name: 'fleet-drift-check',
        description:
          'Check this repository for drift against the golden-path source. Reports which governed surfaces have diverged.',
        args: {},
        preconditions: [
          {
            description: 'Fleet drift script exists',
            command: 'test -f scripts/check-fleet-drift.mjs',
            expect: 'exit 0',
          },
          {
            description: '.fleet.json exists',
            command: 'test -f .fleet.json',
            expect: 'exit 0',
          },
        ],
        steps: [
          {
            order: 1,
            command: 'node scripts/check-fleet-drift.mjs --json',
            description: 'Run fleet drift detection and output JSON report',
          },
          {
            order: 2,
            command:
              'node -e "const r=JSON.parse(require(\'fs\').readFileSync(\'fleet-drift-report.json\',\'utf-8\'));console.log(\'Compliance:\',r.complianceScore+\'%\')"',
            description: 'Display compliance score from report',
          },
        ],
        validation: [
          {
            description: 'No security-critical drift',
            command:
              'node -e "const r=JSON.parse(require(\'fs\').readFileSync(\'fleet-drift-report.json\',\'utf-8\'));const c=r.findings.filter(f=>f.severity===\'security-critical\'&&f.status!==\'compliant\');process.exit(c.length)"',
            expect: 'exit 0',
          },
        ],
        postActions: [
          'If drift detected, run fleet-sync to apply updates',
          'For local improvements, submit improvement-share feedback',
        ],
        related: [
          '.fleet.json',
          'scripts/check-fleet-drift.mjs',
          'docs/runbooks/fleet-feedback-submit.json',
        ],
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── docs/product-roadmap/README.md ────────────────────────────────
  // Derive a prefix from the project name (e.g., my-gov-site → MGS)
  const prefix = name
    .split('-')
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 4) || 'PRJ'
  const today = new Date().toISOString().slice(0, 10)

  writeFileExternal(
    join(targetDir, 'docs', 'product-roadmap', 'README.md'),
    `# Product Roadmap — ${name}

> Version 0.1.0 | Last updated: ${today}
>
> **Structure:** Now / Next / Later — see [downstream adoption guide](../downstream-adoption-guide.md) for requirements.

## Overview

${description}.

## Status Legend

| Status | Meaning |
|--------|---------|
| Done | Completed and verified |
| In Progress | Active development |
| Planned | Scheduled, not yet started |
| Blocked | Waiting on external dependency |

---

## Now (Current Sprint)

| # | Item | Status | Priority | Impact | Effort | Risk |
|---|------|--------|----------|--------|--------|------|
| ${prefix}-001 | Project Setup and Scaffold | In Progress | Critical | High | Low | Low |

### ${prefix}-001: Project Setup and Scaffold

**Status:** In Progress | **Priority:** Critical | **Impact:** High | **Effort:** Low | **Risk:** Low

Scaffold the downstream repo with ripple-next conventions, configure tooling,
and establish the documentation framework.

**Definition of Done:**
- [ ] Repository scaffolded with \`pnpm generate:scaffold\`
- [ ] CI/CD pipeline configured and passing
- [ ] \`.env.example\` created with all required variables
- [ ] CLAUDE.md and AGENTS.md reviewed and customised
- [ ] \`pnpm verify\` passes cleanly

---

## Next (1–3 Sprints)

| # | Item | Status | Priority | Impact | Effort | Risk |
|---|------|--------|----------|--------|--------|------|
| ${prefix}-002 | TODO: First Feature | Planned | High | High | Medium | Medium |

### ${prefix}-002: TODO: First Feature

**Status:** Planned | **Priority:** High | **Impact:** High | **Effort:** Medium | **Risk:** Medium

TODO: Describe the first feature to be implemented after scaffold setup.

**Definition of Done:**
- [ ] TODO: Add acceptance criteria

---

## Later (3+ Sprints / Backlog)

| # | Item | Status | Priority |
|---|------|--------|----------|
| ${prefix}-003 | TODO: Future capability | Planned | Medium |

---

## Risks & Unknowns

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TODO: Identify project risks | Medium | High | TODO: Add mitigation strategy |

## Parked (Considered, Not Scheduled)

- None yet

---

*Maintained by AI agents as part of the documentation governance directive (ADR-023).*
*Use the [downstream adoption guide](../downstream-adoption-guide.md) for documentation standards.*
`,
    targetDir,
    opts
  )

  // ── docs/architecture.md ────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'architecture.md'),
    `# Architecture — ${name}

> Last updated: ${today}
>
> See [downstream adoption guide](./downstream-adoption-guide.md) for documentation requirements.

## System Overview

\`\`\`mermaid
graph TD
    subgraph "Client"
        A[Browser / Mobile]
    end

    subgraph "${name}"
        B[Nuxt 3 Application]
        C[API Routes / oRPC]
        D[ripple-next Providers]
    end

    subgraph "External Services"
        E[Auth Provider]
        F[Database]
        G[CMS]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
\`\`\`

> **Edit this diagram** to reflect your actual system topology.

## Stack

| Layer | Technology | ripple-next Package | ADR |
|-------|-----------|---------------------|-----|
| Framework | Nuxt 3 | — | — |
| UI Components | Vue 3 | \`@ripple-next/ui\` | — |
| API Layer | oRPC | — | — |
| Auth | OIDC | \`@ripple-next/auth\` | — |
| Database | Drizzle ORM | \`@ripple-next/db\` | — |
| CMS | Decoupled | \`@ripple-next/cms\` | — |
| Validation | Zod | \`@ripple-next/validation\` | — |
| Infrastructure | SST v3 (Pulumi) | — | — |
| Compute | Lambda (default) | — | — |

> **Update this table** with your actual stack choices and link to relevant ADRs.

## Provider Pattern

Every infrastructure concern uses the [provider pattern](https://github.com/${org}/ripple-next/blob/main/docs/provider-pattern.md).
Tests always use memory/mock providers — never cloud services.

| Concern | Test Provider | Local Provider | Production Provider |
|---------|--------------|----------------|---------------------|
| Auth | MockAuthProvider | MockAuthProvider | OidcAuthProvider |
| Database | MemoryDbProvider | SqliteProvider | PostgresProvider |
| TODO | TODO | TODO | TODO |

> **Fill in** providers for each infrastructure concern in your project.

## Compute Decisions

| Route/Function | Compute | Rationale |
|---------------|---------|-----------|
| API routes | Lambda | Default — stateless request/response |
| TODO | TODO | TODO |

## Deviations from Golden Path

| Area | Golden Path | Our Choice | Rationale | ADR |
|------|-------------|------------|-----------|-----|
| None yet | — | — | — | — |

> Document any deviations from ripple-next conventions here with an ADR reference.

## Related Documentation

- [Product Roadmap](./product-roadmap/README.md)
- [API Contracts](./api-contracts.md)
- [Readiness Manifest](./readiness.json)
- [ADR Index](./adr/README.md)
- [Downstream Adoption Guide](./downstream-adoption-guide.md)
- [Platform Capabilities](https://github.com/${org}/ripple-next/blob/main/docs/platform-capabilities.md)
`,
    targetDir,
    opts
  )

  // ── docs/api-contracts.md ───────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'api-contracts.md'),
    `# API Contracts — ${name}

> Last updated: ${today}
>
> See [downstream adoption guide](./downstream-adoption-guide.md) for documentation requirements.
> See [ADR-021: API Contract Strategy](https://github.com/${org}/ripple-next/blob/main/docs/adr/021-api-contract-strategy.md) for conventions.

## Endpoint Inventory

| Procedure | Method | Path | Visibility | Auth | Description |
|-----------|--------|------|-----------|------|-------------|
| \`health.check\` | GET | \`/api/health\` | Public | None | Health check endpoint |
| TODO | TODO | TODO | TODO | TODO | TODO: Add your endpoints |

> **Update this table** with every API endpoint in your project.

## OpenAPI Pipeline

\`\`\`mermaid
graph LR
    A[oRPC Router] --> B[pnpm generate:openapi]
    B --> C[docs/api/openapi.json]
    C --> D[CI: Check for breaking changes]
    D --> E[PR Comment: Contract diff]
\`\`\`

If your project uses oRPC, run \`pnpm generate:openapi\` to produce the OpenAPI spec
at \`docs/api/openapi.json\`.

## Contract Testing

- All API endpoints must have contract tests verifying request/response schemas
- Use Zod schemas from \`@ripple-next/validation\` or your project's schema directory
- Tests use memory providers — never call external services

## Breaking Change Policy

1. **No unannounced breaking changes** — all contract changes must be documented
2. **Deprecation window** — deprecated endpoints must remain functional for at least one release
3. **Migration notes** — breaking changes require an entry in \`docs/migration-notes.md\`

## Related Documentation

- [Architecture](./architecture.md)
- [Product Roadmap](./product-roadmap/README.md)
- [Readiness Manifest](./readiness.json)
- [Downstream Adoption Guide](./downstream-adoption-guide.md)
`,
    targetDir,
    opts
  )

  // ── docs/downstream-adoption-guide.md (link to upstream) ───────────
  writeFileExternal(
    join(targetDir, 'docs', 'downstream-adoption-guide.md'),
    `# Downstream Adoption Guide

> This is a local reference. The authoritative version lives in the
> [ripple-next upstream repository](https://github.com/${org}/ripple-next/blob/main/docs/downstream-adoption-guide.md).

See the upstream guide for:
- 7 mandatory documentation categories
- Greenfield and legacy migration adoption paths
- Provider pattern adoption
- Conformance requirements and fleet governance

Run \`pnpm conform\` to check your documentation compliance score.
`,
    targetDir,
    opts
  )
}
