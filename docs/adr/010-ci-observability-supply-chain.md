# ADR-010: CI Observability and Supply-Chain Provenance

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** CI test results are only partially observable (Playwright artifacts on failure). Supply-chain provenance is missing from releases. Reusable workflow patterns are duplicated across jobs.

## Context

The CI pipeline was functional but had three gaps affecting agent effectiveness and
security posture:

1. **Test observability** — Unit/integration test results were only visible in CI logs.
   No structured artifacts (JUnit XML, coverage reports) were uploaded, making it hard
   for agents and developers to diagnose failures at scale.

2. **Supply-chain provenance** — Published `@ripple-next/*` packages had no SBOM or build
   provenance attestations, a gap for government security requirements.

3. **Workflow duplication** — Setup steps (Node, pnpm, install) were repeated in every
   CI job. No reusable composite actions existed for downstream repos to reference.

## Decision

### 1. Structured test artifact uploads

Add JUnit XML reporter to Vitest test runs and upload results as CI artifacts with
30-day retention. E2E Playwright results use separate artifact names with traces
retained for 7 days on failure.

**Artifact naming convention:**

| Artifact | Contents | Retention |
|----------|----------|-----------|
| `test-results-unit` | JUnit XML from Vitest | 30 days |
| `test-results-e2e` | Playwright HTML report | 30 days |
| `playwright-traces` | Playwright traces (failure only) | 7 days |
| `coverage-report` | Coverage JSON summary | 30 days |

### 2. SBOM and build provenance

Add CycloneDX SBOM generation and `actions/attest-build-provenance` to the release
workflow. SBOM is generated from the lockfile and uploaded alongside releases with
90-day retention.

### 3. Reusable composite actions

Extract common CI patterns into `.github/actions/`:

| Action | Purpose |
|--------|---------|
| `setup` | Node.js + pnpm + frozen lockfile install |
| `quality` | Lint + typecheck + readiness drift guard |
| `test` | Run tests with JUnit reporter + artifact upload |

These actions can be referenced by downstream repos that consume `@ripple-next/*` packages,
reducing CI configuration drift across the fleet.

## Rationale

### Why JUnit XML (not custom JSON)

JUnit XML is the de facto standard for CI test result reporting. GitHub Actions,
GitLab CI, Jenkins, and most CI visualization tools understand it natively. Vitest
supports it as a built-in reporter — zero additional dependencies.

### Why CycloneDX (not SPDX)

Both are valid SBOM formats. CycloneDX was chosen because:

- First-class npm/pnpm tooling (`@cyclonedx/cyclonedx-npm`)
- JSON output (easier for agent consumption than SPDX tag-value)
- Growing government adoption alongside SPDX

SPDX can be added later if compliance requires it.

### Why composite actions (not reusable workflows)

Composite actions are referenced per-step and compose within any workflow structure.
Reusable workflows (`.yml` with `workflow_call`) are more rigid — they define entire
jobs and can't be mixed into existing job steps. Composite actions give downstream
repos maximum flexibility.

### Why 30-day retention for test artifacts

Balances storage cost with debugging utility. Most test failures are investigated
within days. 30 days covers a full sprint cycle. Playwright traces use 7-day retention
because they are large binary files only needed for immediate debugging.

### Alternatives considered

| Option | Why not |
|--------|---------|
| **Custom test dashboard** | Over-engineering; GitHub artifact viewer is sufficient for current scale |
| **Third-party CI analytics** (Datadog CI, BuildPulse) | Adds vendor dependency; can adopt later if scale demands it |
| **SLSA Level 3 provenance** | Requires isolated build environment; Level 1 (attestation) is a good starting point |
| **Reusable workflows** | Too rigid; composite actions compose better for fleet repos with varying CI needs |

## Consequences

- CI test results now available as downloadable artifacts (JUnit XML + coverage)
- Agents can download and parse structured test results for automated triage
- SBOM generated on every release — satisfies government supply-chain transparency
- Build provenance attestations provide tamper-evident release trail
- Composite actions reduce CI setup duplication from ~15 lines per job to 1 line
- Downstream repos can reference `.github/actions/{setup,quality,test}` for consistency
- Agent-friction scorecard observability dimension improves from 3/5 to 4/5
- `readiness.json` CI subsystem blockers updated to reflect resolved artifact gap

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — test architecture that produces these artifacts
- [Architecture](../architecture.md) — system overview
- [Product Roadmap](../product-roadmap/) — Phase 1/2 items this resolves
