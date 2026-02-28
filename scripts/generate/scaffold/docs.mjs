/**
 * Scaffold: Documentation structure.
 *
 * Generates starter readiness.json, error-taxonomy.json, ADR index,
 * first ADR, runbook template, and product roadmap template.
 */
import { join } from 'node:path'
import { writeFileExternal } from '../lib.mjs'

export function scaffoldDocs(targetDir, config, options = {}) {
  const { name, description } = config
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

  // ── docs/product-roadmap/README.md ────────────────────────────────
  writeFileExternal(
    join(targetDir, 'docs', 'product-roadmap', 'README.md'),
    `# Product Roadmap — ${name}

## Overview

${description}.

## Status Legend

| Status | Meaning |
|--------|---------|
| Planned | Not yet started |
| In Progress | Active development |
| Done | Completed and verified |
| Blocked | Waiting on external dependency |

## Roadmap Items

### Foundation

- [ ] Project scaffold and tooling setup
- [ ] CI/CD pipeline configuration
- [ ] Core package architecture
- [ ] Documentation framework

### Phase 1

- [ ] TODO: Add your first phase items here

### Phase 2

- [ ] TODO: Add your second phase items here

---

*Updated by AI agents as part of the documentation maintenance directive.*
`,
    targetDir,
    opts
  )
}
