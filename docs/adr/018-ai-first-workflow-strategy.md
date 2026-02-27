# ADR-018: AI-First Workflow Strategy — Runbooks, Generators, and Error Taxonomy

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

Ripple Next was designed as an **AI-agent-first** platform from inception. Prior
ADRs established the foundational patterns: provider pattern for fast test loops
(ADR-003), machine-readable diagnostics (ADR-012), tiered CI (ADR-010), and
priority-tier roadmap governance (ADR-016).

However, three gaps remain in the agent development experience:

1. **No codified runbooks** — Common multi-step operations (deploy, rollback,
   add a new component, add a new provider) require agents to reconstruct
   procedures from scattered documentation. This leads to inconsistent execution
   and wasted context window parsing docs.

2. **No structured error taxonomy** — When quality gates, tests, or deployments
   fail, agents must parse free-text error output to determine the failure
   category and remediation path. There is no machine-parseable mapping from
   error to action.

3. **No code scaffolding generators** — Adding a new component, provider, or API
   endpoint requires agents to manually replicate boilerplate from existing
   examples. This is error-prone and wastes tokens on pattern matching rather
   than creative work.

Additionally, the agent-friction scorecard (34/35) lacked a dimension for
**agent workflow integration** — the degree to which the platform proactively
supports agent development patterns beyond just being parseable.

## Decision

Adopt a three-pillar AI-first workflow strategy and add corresponding roadmap
items:

### Pillar 1: Agent Runbook Automation (RN-039)

Create a `docs/runbooks/` directory containing structured, executable runbooks
for all common operations. Each runbook follows a standard template:

```yaml
name: add-new-component
preconditions:
  - pnpm doctor passes
  - packages/ui/ exists
steps:
  - command: pnpm generate:component {name}
    description: Scaffold component SFC, test, and story
  - command: pnpm test -- --filter @ripple/ui
    description: Verify component tests pass
  - command: pnpm lint
    description: Verify lint passes
validation:
  - packages/ui/components/**/{name}.vue exists
  - packages/ui/tests/**/{name}.test.ts exists
```

A `pnpm runbook <name>` command will print the runbook steps, with a `--json`
flag for machine-readable output. Agents read the runbook, execute each step,
and validate the postconditions.

### Pillar 2: Structured Error Taxonomy (RN-040)

Define a `docs/error-taxonomy.json` schema that maps every known failure mode
to a category, severity, and remediation path:

```json
{
  "LINT_NO_CONSOLE": {
    "category": "quality-gate",
    "severity": "error",
    "gate": "pnpm lint",
    "remediation": "Replace console.log with console.warn/console.error or remove the statement"
  }
}
```

All CLI tools (`pnpm doctor`, `pnpm validate:env`, future `pnpm lint --json`)
should reference taxonomy codes in their structured output, enabling agents to
look up remediation paths programmatically.

### Pillar 3: Code Generation Templates (RN-041)

Provide `pnpm generate:*` commands that scaffold convention-compliant code:

- `pnpm generate:component <name>` — Vue SFC + test + Storybook story
- `pnpm generate:provider <package> <name>` — Provider class + conformance test
- `pnpm generate:endpoint <router> <procedure>` — tRPC procedure + test
- `pnpm generate:package <name>` — Full package scaffold

Generators enforce naming conventions, file structure, and required test stubs
automatically. A `--dry-run` flag previews generated files without writing.

### Scorecard Update

The agent-friction scorecard gains a new dimension:

| Dimension | Score | Notes |
|-----------|-------|-------|
| Agent workflow integration | 4/5 | Runbooks, generators, error taxonomy planned; 5/5 when implemented |

Total scorecard moves from 34/35 (7 dimensions) to 38/40 (8 dimensions).

## Rationale

- **Runbooks reduce context waste** — Agents spend tokens reading and
  interpreting scattered docs. Structured runbooks give agents a single source
  of truth for each operation.

- **Error taxonomy enables auto-remediation** — When an agent can look up
  `LINT_NO_CONSOLE` and get "Replace console.log with console.warn", it can fix
  the issue without human help. This is the foundation for self-healing CI.

- **Generators enforce conventions** — Instead of agents reverse-engineering
  patterns from existing code, generators produce correct boilerplate. This
  eliminates a class of convention-drift bugs.

- **All three pillars are low-risk** — They add tooling and documentation
  without modifying runtime code. Each can be implemented incrementally.

## Consequences

### Positive

- Agent development loops become faster and more reliable.
- New contributors (human and AI) onboard faster with generators and runbooks.
- Error taxonomy creates a foundation for self-healing CI pipelines.
- Scorecard gains a new dimension that tracks agent DX maturity.
- All three pillars benefit human developers equally.

### Negative

- Runbooks and generators require ongoing maintenance as patterns evolve.
- Error taxonomy must be kept in sync with actual error messages.

### Neutral

- Roadmap version bumped from 4.0.0 to 5.0.0 to reflect the strategy addition.
- Five new roadmap items added: RN-039 (runbooks), RN-040 (error taxonomy),
  RN-041 (generators), RN-042 (accessibility audit), RN-043 (agent observability).

## Related

- [Product Roadmap v5.0.0](../product-roadmap/README.md) — updated roadmap
- [ADR-003: Provider Pattern](./003-provider-pattern.md) — fast agent test loops
- [ADR-010: CI Observability](./010-ci-observability-supply-chain.md) — structured artifacts
- [ADR-012: Env Schema Validation](./012-env-schema-validation.md) — machine-readable diagnostics
- [ADR-016: Roadmap Reorganisation](./016-roadmap-reorganisation.md) — AI-first tier system
