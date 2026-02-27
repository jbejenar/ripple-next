# ADR-013: Flaky Test Containment Policy

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** The test suite lacks an explicit strategy for handling flaky tests. When a test intermittently fails, it erodes trust in CI signals and causes agents to waste cycles retrying or investigating false positives. The AI Principal Engineer review identified this as a "Do Next" recommendation.

## Context

Ripple Next has strong test infrastructure (conformance suites, mock providers,
tiered coverage thresholds) but no policy for what happens when a test becomes
flaky. Current problems:

1. **No quarantine mechanism** — Flaky tests either block the pipeline (if kept)
   or get deleted/skipped without tracking (if removed).
2. **No retry budget** — Playwright has CI retries (2), but unit/integration tests
   have no retry strategy or budget cap.
3. **No accountability** — When a test is skipped, there's no mandatory issue
   linkage or time-boxed resolution requirement.
4. **Agent friction** — AI agents cannot distinguish genuine failures from flaky
   noise, causing wasted investigation cycles.

## Decision

### 1. Quarantine annotation convention

Flaky tests are annotated with a standardized marker that includes a mandatory
issue link and a quarantine date:

```typescript
// Unit/integration tests (Vitest)
describe.skip('flaky: MyFeature #123', () => {
  // QUARANTINED: https://github.com/org/ripple-next/issues/123
  // QUARANTINE_DATE: 2026-02-27
  // REASON: Intermittent timeout on CI due to race condition in event handler
})

// E2E tests (Playwright)
test.skip('flaky: user login flow #124', async ({ page }) => {
  // QUARANTINED: https://github.com/org/ripple-next/issues/123
  // QUARANTINE_DATE: 2026-02-27
})
```

### 2. Quarantine rules

- **Maximum quarantine duration**: 14 days. After 14 days, the test must be
  either fixed or permanently removed with an ADR justification.
- **Mandatory issue linkage**: Every quarantined test must reference a GitHub
  issue. The issue must be labeled `flaky-test` and assigned to the team that
  owns the test surface.
- **Maximum quarantine budget**: No more than 5% of total tests may be
  quarantined at any time. This prevents quarantine from becoming a dumping
  ground.
- **No quarantine for Tier 1**: Tests in `packages/auth`, `packages/db`, and
  `packages/queue` (Tier 1 critical) may NOT be quarantined — they must be
  fixed immediately or the PR reverted.

### 3. CI enforcement

A readiness check (`pnpm check:quarantine`) validates quarantine health:

- Counts quarantined tests across all workspaces
- Fails if any quarantine exceeds 14 days
- Fails if quarantine budget (5%) is exceeded
- Reports quarantine status in machine-readable JSON
- Integrated into the quality composite action

### 4. Playwright retry budget

Playwright retries remain at 2 in CI (current setting). If a test fails all
retries, it is a genuine failure. If a test consistently needs retries to pass,
it should be quarantined and fixed.

### 5. Vitest retry configuration

Vitest does not enable retries by default. Individual flaky tests should be
quarantined rather than retried, to maintain signal clarity.

## Consequences

**Positive:**
- Clear, actionable policy for handling flaky tests
- Time-boxed quarantine prevents tests from being forgotten
- Mandatory issue linkage creates accountability
- Budget cap prevents quarantine abuse
- Tier 1 protection ensures critical paths remain fully tested
- Agents can programmatically check quarantine status

**Negative:**
- Adds a new CI check (`check:quarantine`) to the quality gate
- Requires discipline to follow the quarantine annotation convention
- 14-day time box may be aggressive for complex flakiness root causes

**Trade-off:**
The 14-day limit was chosen because most flaky tests are caused by timing issues,
missing cleanup, or non-deterministic ordering — all fixable within a sprint.
If a genuine architectural issue causes flakiness, the fix should be tracked as
a separate work item, and the test can be temporarily removed with a new test
added once the underlying issue is resolved.
