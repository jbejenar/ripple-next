# CLAUDE.md — Claude Code Configuration

## Quick Start

```bash
pnpm bootstrap       # install + doctor + validate (first-time setup)
pnpm doctor          # validate environment
pnpm install         # install deps (if doctor passes)
pnpm test            # run all tests
pnpm lint            # lint all packages
pnpm typecheck       # type check all packages
pnpm validate:env    # validate env vars against Zod schema
pnpm check:readiness # verify readiness.json is not stale
pnpm check:quarantine # verify flaky test quarantine policy (ADR-013)
pnpm check:iac       # IaC policy scan for sst.config.ts (RN-036)
pnpm check:fleet-drift # fleet drift detection (RN-024)
pnpm fleet:sync      # generate sync PRs for downstream repos
pnpm fleet:compliance # fleet-wide compliance report
pnpm verify          # run ALL quality gates with summary (RN-034)
pnpm verify -- --json # machine-readable JSON gate summary
pnpm verify -- --fleet # include fleet drift in quality gates
```

## Project Overview

Full-stack government digital platform. Hybrid monorepo — `@ripple/*` packages
are published to a private npm registry. See `AGENTS.md` for full architecture.

## Key Files for Agent Planning

- `docs/readiness.json` — machine-readable subsystem status (check before starting work)
- `docs/product-roadmap/` — product roadmap (v5.0.0), agent-friction scorecard, improvement tiers
- `docs/adr/018-ai-first-workflow-strategy.md` — AI-first strategy (runbooks, generators, error taxonomy)
- `docs/error-taxonomy.json` — 39 classified error codes across 9 categories (RPL-*-NNN format)
- `docs/fleet-policy.json` — fleet governance contract: governed surfaces, sync strategies (RN-024)
- `docs/downstream-workflows.md` — guide for consuming reusable CI composite actions
- `AGENTS.md` — architecture, conventions, validation requirements
- `vitest.workspace.ts` — test suites with risk-tiered coverage thresholds
- `.changeset/config.json` — version management config
- `.env.example` — environment variable contract with defaults

## Before Making Changes

1. Read `docs/readiness.json` to understand subsystem status
2. Run `pnpm doctor` to validate the environment
3. Check `AGENTS.md` → "Agent Task Routing" for required validation per change type

## After Making Changes

Run `pnpm verify` to execute all quality gates with a structured summary, or run
them individually:

1. `pnpm test` — all tests must pass
2. `pnpm lint` — zero errors (no-console is an error, not a warning)
3. `pnpm typecheck` — zero type errors
4. `pnpm check:readiness` — manifest must not drift
5. `pnpm check:quarantine` — quarantine policy must be satisfied
6. `pnpm check:iac` — IaC policies must pass (if you changed `sst.config.ts`)
7. If you changed a published package's API: `pnpm changeset` to add version intent

Use `pnpm verify -- --json` for machine-readable JSON output (schema: `ripple-gate-summary/v1`).

## Provider Pattern (Critical)

Every infrastructure concern uses a provider interface. Tests ALWAYS use memory/mock providers.

When implementing a new provider:
1. Implement the interface from `packages/<concern>/types.ts`
2. Run the conformance suite from `packages/testing/conformance/`
3. All conformance tests must pass before the provider is considered done

Example:
```ts
import { queueConformance } from '@ripple/testing/conformance/queue.conformance'
import { MyNewQueueProvider } from './my-provider'

queueConformance({
  name: 'MyNewQueueProvider',
  factory: () => new MyNewQueueProvider(config),
})
```

## Coverage Thresholds (Enforced)

- **Tier 1** (auth, db, queue): 60% lines/functions/statements, 50% branches
- **Tier 2** (cms, email, storage, events, validation): 40% lines/functions/statements, 30% branches
- **Tier 3** (UI, services): 20% lines/functions/statements, 10% branches

Never lower a threshold — only raise it.

## Lint Rules (Strict)

- `no-console` is an **error** (use `console.warn`/`console.error` if needed)
- `@typescript-eslint/no-explicit-any` is an **error** (use `unknown` + type guards)
- Test files and `migrate.ts`/`seed.ts`/`*.handler.ts` are exempt from no-console

## Nuxt Auto-Imports

Do NOT add manual imports for: `ref`, `computed`, `watch`, `onMounted`, `useRoute`,
`useRouter`, `useFetch`, `useState`, `navigateTo`, `definePageMeta`,
`defineEventHandler`, `getQuery`, `readBody`, `createError`, `setResponseStatus`.

DO manually import: anything from `@ripple/*` packages, `node_modules`, tRPC utilities.

## AI-First Workflow Strategy (ADR-018)

This platform treats AI agents as first-class developers. Three pillars:

1. **Runbooks** — Codified, executable procedures for common operations (RN-039, done)
2. **Error Taxonomy** — Machine-parseable error codes with remediation paths (RN-040, done)
3. **Code Generators** — `pnpm generate:*` commands for scaffolding (RN-041, done)

Available generators:
```bash
pnpm generate:component <name> [--tier=atoms|molecules|organisms] [--dry-run]
pnpm generate:provider <package> <name> [--dry-run]
pnpm generate:endpoint <router> <procedure> [--dry-run]
pnpm generate:package <name> [--dry-run]
```

Available runbooks (`pnpm runbook --list`):
```bash
pnpm runbook deploy-to-staging      # Build, validate, deploy to staging
pnpm runbook rollback-production    # Roll back to known-good version
pnpm runbook add-new-provider       # Scaffold + implement provider
pnpm runbook add-new-component      # Scaffold + implement UI component
pnpm runbook add-api-endpoint       # Scaffold + implement tRPC endpoint
pnpm runbook onboard-new-package    # Scaffold full @ripple/* package
pnpm runbook fleet-sync             # Fleet drift detection + sync PR
pnpm runbook <name> -- --json       # Machine-readable JSON output
```

See `docs/adr/018-ai-first-workflow-strategy.md` for the full strategy.

## Fleet Governance (ADR-019, RN-024)

Downstream repos are governed by `docs/fleet-policy.json` which defines 8
governed surfaces across 3 severity levels:

- **Security-critical** (immediate PR): composite actions, toolchain pins, security config, IaC policies
- **Standards-required** (weekly batch): CI workflows, quality scripts, ESLint config, error taxonomy
- **Recommended** (report only): future advisory surfaces

Fleet commands:
```bash
pnpm check:fleet-drift                          # self-check (golden path)
pnpm check:fleet-drift -- --target=/path/to/repo # check downstream repo
pnpm check:fleet-drift -- --json                 # JSON drift report
pnpm fleet:sync -- --target=/path/to/repo        # apply sync to downstream
pnpm fleet:sync -- --dry-run                     # preview sync actions
pnpm fleet:compliance -- --json                  # fleet-wide compliance report
```

Exception workflow: `// fleet-policy-exception: FLEET-SURF-NNN — justification` (90-day expiry).

## Documentation Maintenance (Default Agent Directive)

Every AI agent run that adds or modifies a subsystem MUST update documentation as
part of the same change:

1. **`docs/readiness.json`** — update subsystem status, description, blockers, coverage
2. **`docs/product-roadmap/README.md`** — check off completed roadmap items, update status
3. **Provider docs** (`docs/provider-pattern.md`) — add new providers to the table
4. **API docs** (`docs/api-contracts.md`) — add new routes/endpoints
5. **Architecture docs** (`docs/architecture.md`) — update diagrams if new subsystem added
6. **ADRs** (`docs/adr/`) — create a new ADR for significant architectural decisions
7. **README.md** and **AGENTS.md** — update repo structure and stack tables

Run `pnpm check:readiness` after doc changes to ensure the manifest is not stale.
