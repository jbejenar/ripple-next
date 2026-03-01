# Downstream Workflow Consumption Guide

> How to use Ripple Next's reusable workflows, composite actions, and fleet governance in downstream repositories.

> **Looking for what to build?** See the [Downstream Adoption Guide](./downstream-adoption-guide.md)
> for documentation standards, adoption paths, and migration methodology.
> This document covers CI consumption and fleet governance operations only.

## Fleet Management Quick Reference

| Task | Command |
|------|---------|
| **Bootstrap a new downstream repo** | `pnpm generate:scaffold /path/to/repo --name=my-project --org=my-org` |
| **Check drift against golden path** | `pnpm check:fleet-drift -- --target=/path/to/repo` |
| **Preview sync changes (dry run)** | `pnpm fleet:sync -- --target=/path/to/repo --dry-run` |
| **Apply sync to downstream repo** | `pnpm fleet:sync -- --target=/path/to/repo` |
| **View fleet compliance (multi-repo)** | `pnpm fleet:compliance -- --reports=./reports` |
| **Submit feedback upstream** | `pnpm fleet:feedback -- --type=<type> --title="..." --description="..." --submit` |
| **Share a local improvement upstream** | `pnpm fleet:feedback -- --type=improvement-share --surface=FLEET-SURF-005 --file=eslint.config.js --submit` |
| **View fleet changelog** | `pnpm fleet:changelog` |
| **Validate changelog structure** | `pnpm fleet:changelog -- --validate` |

### Downstream repo commands (after scaffolding)

| Task | Command |
|------|---------|
| **Self-check for drift** | `node scripts/check-fleet-drift.mjs` |
| **Submit feedback to upstream** | `node scripts/fleet-feedback.mjs --type=<type> --title="..." --description="..." --submit` |
| **Preview feedback payload** | `node scripts/fleet-feedback.mjs --type=<type> --title="..." --dry-run --json` |
| **Run fleet feedback submit runbook** | `pnpm runbook fleet-feedback-submit` |

### Key files in downstream repos

| File | Purpose |
|------|---------|
| `.fleet.json` | Tracks golden-path version, last sync time, policy version |
| `scripts/check-fleet-drift.mjs` | Drift detection against golden path (synced via SURF-011) |
| `scripts/fleet-feedback.mjs` | Structured feedback submission to upstream |
| `.github/workflows/fleet-feedback.yml` | Manual dispatch + monthly auto-scan for drift |
| `.github/workflows/fleet-update.yml` | Receives update notifications from golden path |
| `docs/runbooks/fleet-feedback-submit.json` | Step-by-step runbook for feedback submission |

---

## Overview

Ripple Next provides **two levels** of CI reuse for downstream repos:

### Reusable Workflows (`workflow_call`) — Recommended

Full workflow pipelines that downstream repos call with `uses:`. These handle
the entire job including runner setup, service containers, and artifact uploads.

| Workflow | Purpose | Key Features |
|----------|---------|--------------|
| `reusable-quality.yml` | Lint, typecheck, policy gates | Readiness drift, quarantine check, optional IaC scan |
| `reusable-test.yml` | Test execution + services | PostgreSQL + Redis, coverage, JUnit artifacts |
| `reusable-security.yml` | CodeQL + dependency review + secret audit | Configurable severity thresholds |

### Composite Actions (`.github/actions/`)

Lower-level building blocks for custom workflow composition:

| Action | Purpose | Key Features |
|--------|---------|--------------|
| `setup` | Node.js + pnpm installation | Frozen lockfile, pnpm + Turbo caching, optional registry URL |
| `quality` | Lint, typecheck, policy gates | Readiness drift guard, quarantine check |
| `test` | Test execution + artifact upload | JUnit XML, coverage reports, 30-day retention |

## Prerequisites

- Your repository must use **pnpm** as its package manager
- Node.js 22 (default, configurable)
- The actions/workflows expect standard pnpm scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test:ci`

## Reusable Workflow Reference

Reusable workflows are the simplest way to adopt Ripple Next's CI standards.
They encapsulate entire jobs and require minimal configuration.

### `reusable-quality.yml` — Quality Gates

Runs lint, typecheck, readiness drift guard, quarantine check, and optional IaC scan.

**Inputs:**

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `node-version` | No | from `.nvmrc` | Node.js version override |
| `run-iac-scan` | No | `false` | Run IaC policy scan (for repos with `sst.config.ts`) |

**Outputs:** `status` — `pass` or `fail`

**Usage:**

```yaml
jobs:
  quality:
    uses: your-org/ripple-next/.github/workflows/reusable-quality.yml@v1
    with:
      run-iac-scan: false
```

### `reusable-test.yml` — Test Suite

Runs unit and integration tests with PostgreSQL and Redis service containers.

**Inputs:**

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `node-version` | No | from `.nvmrc` | Node.js version override |
| `postgres-version` | No | `17-alpine` | PostgreSQL image tag |
| `redis-version` | No | `7-alpine` | Redis image tag |
| `coverage` | No | `true` | Generate coverage reports |
| `run-migrations` | No | `true` | Run `pnpm db:migrate` before tests |

**Outputs:** `status` — `pass` or `fail`

**Usage:**

```yaml
jobs:
  test:
    uses: your-org/ripple-next/.github/workflows/reusable-test.yml@v1
    with:
      coverage: true
      run-migrations: true
```

### `reusable-security.yml` — Security Pipeline

Runs CodeQL SAST, dependency review, and secret scanning.

**Inputs:**

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `codeql-languages` | No | `javascript-typescript` | Languages for CodeQL |
| `enable-dependency-review` | No | `true` | Dependency review on PRs |
| `enable-secret-audit` | No | `true` | Secret scanning via gitleaks |
| `fail-on-severity` | No | `high` | Min severity to fail (`low`, `moderate`, `high`, `critical`) |

**Outputs:** `status` — `pass` or `fail`

**Usage:**

```yaml
jobs:
  security:
    uses: your-org/ripple-next/.github/workflows/reusable-security.yml@v1
    with:
      fail-on-severity: high
    permissions:
      security-events: write
      contents: read
      actions: read
```

---

## Composite Action Reference

### `setup` — Node.js + pnpm Setup

Installs Node.js, pnpm, and project dependencies with frozen lockfile.

**Inputs:**

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `node-version` | No | `22` | Node.js version to install |
| `registry-url` | No | `''` | npm registry URL (for publish steps) |

**Usage:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: your-org/ripple-next/.github/actions/setup@v1
    with:
      node-version: '22'
```

### `quality` — Quality Gates

Runs lint, typecheck, readiness drift guard, and quarantine policy check.

**Inputs:** None.

**Prerequisites:** The `setup` action must have run first.

**Usage:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: your-org/ripple-next/.github/actions/setup@v1
  - uses: your-org/ripple-next/.github/actions/quality@v1
```

### `test` — Test Execution + Artifacts

Runs Vitest tests with JUnit reporter and uploads structured artifacts.

**Inputs:**

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `upload-artifacts` | No | `true` | Whether to upload test result artifacts |
| `coverage` | No | `true` | Whether to generate coverage reports |

**Usage:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: your-org/ripple-next/.github/actions/setup@v1
  - uses: your-org/ripple-next/.github/actions/test@v1
    with:
      coverage: 'true'
    env:
      DATABASE_URL: ${{ env.DATABASE_URL }}
      REDIS_URL: ${{ env.REDIS_URL }}
```

## Example Workflows

### Using Reusable Workflows (Simplest)

The easiest way to adopt Ripple Next's CI standards. Each `uses:` call handles
the full job — runners, services, artifacts — with zero boilerplate:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    uses: your-org/ripple-next/.github/workflows/reusable-quality.yml@v1

  test:
    needs: quality
    uses: your-org/ripple-next/.github/workflows/reusable-test.yml@v1

  security:
    uses: your-org/ripple-next/.github/workflows/reusable-security.yml@v1
    permissions:
      security-events: write
      contents: read
      actions: read
```

### Minimal CI Workflow (Composite Actions)

A basic CI workflow using composite actions directly:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@v1
      - uses: your-org/ripple-next/.github/actions/quality@v1
      - uses: your-org/ripple-next/.github/actions/test@v1
```

### Tiered CI Workflow

A more advanced setup that mirrors Ripple Next's tiered CI model:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  # Tier 1: Fast quality gates on every PR
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@v1
      - uses: your-org/ripple-next/.github/actions/quality@v1

  # Tier 1: Unit tests on every PR
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@v1
      - uses: your-org/ripple-next/.github/actions/test@v1

  # Tier 2: E2E tests on merge to main only
  e2e:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@v1
      - run: pnpm test:e2e
```

### Publish Workflow with Registry

For downstream repos that publish packages:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@v1
        with:
          registry-url: 'https://registry.npmjs.org'
      - uses: your-org/ripple-next/.github/actions/quality@v1
      - uses: your-org/ripple-next/.github/actions/test@v1
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Version Pinning Strategy

### Rollout Channels

Ripple Next uses **two rollout channels** for workflow/action references:

| Channel | Git Ref | Use Case | Update Cadence |
|---------|---------|----------|----------------|
| **Stable** | `@v1`, `@v1.2.0` | Production repos | Manual, controlled |
| **Canary** | `@main` | Early adopters, testing | Automatic on merge |

### Recommended: Pin to a versioned tag

For production stability, pin to a major version tag:

```yaml
# Reusable workflows — pin to major version (recommended)
uses: your-org/ripple-next/.github/workflows/reusable-quality.yml@v1

# Composite actions — pin to major version
uses: your-org/ripple-next/.github/actions/setup@v1

# Pin to exact version for maximum determinism
uses: your-org/ripple-next/.github/workflows/reusable-test.yml@v1.2.0

# Pin to a specific commit SHA (most stable)
uses: your-org/ripple-next/.github/actions/setup@a1b2c3d
```

### Acceptable: Pin to `main` (canary channel)

For repos that want to track the latest upstream changes:

```yaml
# Tracks latest — receives updates automatically
uses: your-org/ripple-next/.github/actions/setup@main
```

### Not recommended: Using `latest` or floating tags

Avoid tags that can change unexpectedly. Always use deterministic references
to prevent CI breakage from upstream changes.

### Update Strategy

1. **Dependabot / Renovate**: Configure to track the composite action references
2. **Manual updates**: Periodically check for new releases and update your SHA pins
3. **Fleet sync** (RN-024): Automated fleet governance detects drift and opens sync PRs. See [ADR-019](./adr/019-fleet-governance.md) and the [fleet-drift workflow](../.github/workflows/fleet-drift.yml). Run `pnpm check:fleet-drift -- --target=/path/to/repo` to check a downstream repo manually

## Turbo Cache

Turbo caches task outputs locally in `.turbo/` to avoid re-executing unchanged
work (builds, lints, typechecks). This is persisted between CI runs using
`actions/cache@v4`.

### How it works

The cache key is derived from **lockfile + turbo config + Node version**:

```
turbo-{os}-{hash(.nvmrc)}-{hash(pnpm-lock.yaml, turbo.json)}
```

Restore keys fall back progressively: same OS + Node version first, then same OS
only. Turbo's own content-addressable hashing handles granular invalidation —
if source files, dependencies, or env vars (e.g. `NITRO_PRESET`) change, Turbo
produces a new hash and skips the stale entry automatically.

### Local development

Turbo caches locally by default — no configuration needed. The `.turbo/`
directory is gitignored. Run `pnpm clean` to clear both Turbo cache and
`node_modules`.

### Optional: Turbo Remote Cache

For teams that want cross-machine cache sharing (e.g. between CI and local dev),
Turbo supports [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
via Vercel or self-hosted backends. This is **not required** — the local
`actions/cache` approach covers CI-to-CI sharing. To enable remote caching:

1. Run `npx turbo login` and `npx turbo link`
2. Or set `TURBO_TOKEN` and `TURBO_TEAM` environment variables in CI
3. Add `remoteCache` configuration to `turbo.json` if using a self-hosted backend

### Cache correctness

Turbo invalidates cached outputs when any of these change:

- Source files in the task's input glob
- Outputs of dependency tasks (`dependsOn`)
- Environment variables listed in the task's `env` array (e.g. `NITRO_PRESET` for `build`)
- The `turbo.json` configuration itself

The CI cache key additionally invalidates on lockfile or Node version changes,
ensuring no stale outputs survive runtime or dependency upgrades.

---

## Artifacts Produced

When using the reusable workflows or test action, these artifacts are uploaded:

| Artifact | Contents | Retention |
|----------|----------|-----------|
| `test-results-unit` | JUnit XML test reports | 30 days |
| `coverage-report` | JSON summary + text coverage | 30 days |

## Troubleshooting

### `pnpm: command not found`

Ensure the `setup` action runs before `quality` or `test`. The setup action
installs pnpm via `pnpm/action-setup@v4`. When using reusable workflows, this
is handled automatically.

### Lockfile conflicts

The setup action uses `--frozen-lockfile`. If you get lockfile errors, run
`pnpm install` locally and commit the updated `pnpm-lock.yaml`.

### Missing quality scripts

The `quality` action/workflow expects these pnpm scripts:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm check:readiness`
- `pnpm check:quarantine`

If your repo doesn't have all of these, add no-op scripts or use the actions
individually instead of the composite `quality` action. The reusable quality
workflow runs `check:readiness` and `check:quarantine` with `continue-on-error`,
so missing scripts won't block the pipeline.

## Bootstrapping a Downstream Repository

Before consuming reusable workflows and composite actions, downstream repos need
the supporting infrastructure — quality gate scripts, documentation structure,
AI agent configuration, and project config files.

The **scaffold generator** creates all of this in one command:

```bash
# From the ripple-next repo:
pnpm generate:scaffold /path/to/downstream-repo \
  --name=my-project \
  --org=my-github-org \
  --description="My downstream project"
```

This generates ~35 files across 6 categories:

| Category | What's Generated |
|----------|-----------------|
| AI / Agent DX | `CLAUDE.md`, `AGENTS.md`, `.github/agents/` (5 agents incl. fleet-governance), `.github/instructions/`, `.github/prompts/`, Copilot instructions |
| Documentation | `docs/readiness.json`, `docs/error-taxonomy.json`, ADR index, runbook templates (deploy, fleet-feedback-submit, fleet-drift-check), product roadmap template |
| Quality Gates | `scripts/verify.mjs`, `scripts/doctor.sh`, `scripts/check-readiness.mjs`, `scripts/validate-env.mjs` |
| Fleet Governance | `.fleet.json`, `scripts/check-fleet-drift.mjs`, `scripts/fleet-feedback.mjs`, `.github/workflows/fleet-feedback.yml`, `.github/workflows/fleet-update.yml` |
| CI / CD | `.github/workflows/ci.yml`, `.github/workflows/security.yml`, composite actions, PR template, CODEOWNERS |
| Config | `.env.example`, `.nvmrc`, `eslint.config.js`, `.changeset/config.json`, `.gitignore` |

After scaffolding, use `--dry-run` to preview and `--force` to update existing files.

For **ongoing governance**, use fleet-sync to detect drift and keep downstream
repos aligned with the golden path:

```bash
pnpm check:fleet-drift -- --target=/path/to/downstream-repo
pnpm fleet:sync -- --target=/path/to/downstream-repo
```

See `pnpm runbook scaffold-downstream` for the full step-by-step procedure.

## Fleet Update Notifications

Downstream repos can receive **proactive notifications** when the golden-path source publishes a new release. This enables AI agents to evaluate and adopt updates autonomously.

### How It Works

1. When ripple-next publishes a release, the `fleet-update-notify.yml` workflow fires
2. It dispatches a `fleet-update-available` event to all registered downstream repos
3. Downstream repos have a `fleet-update.yml` workflow (scaffolded) that processes the event
4. An issue is created in the downstream repo with the changelog summary
5. AI agents evaluate the changes and decide whether to adopt

### Setup

1. Add your downstream repo to the `FLEET_DOWNSTREAM_REPOS` repository variable in ripple-next (JSON array of `owner/repo` strings)
2. Ensure `FLEET_SYNC_TOKEN` has `contents: write` scope on downstream repos
3. The scaffolded `fleet-update.yml` workflow handles the `repository_dispatch` event automatically

### Version Tracking (`.fleet.json`)

Each downstream repo has a `.fleet.json` file that tracks its relationship to the golden path:

```json
{
  "schema": "ripple-fleet-version/v1",
  "goldenPathRepo": "org/ripple-next",
  "goldenPathVersion": "abc1234...",
  "scaffoldedAt": "2026-03-01T00:00:00Z",
  "lastSyncedAt": "2026-03-01T00:00:00Z",
  "fleetPolicyVersion": "1.2.0"
}
```

AI agents can read `.fleet.json` to understand how far behind the golden path the repo is. The `fleet-sync` command updates this file automatically after each sync.

---

## Fleet Feedback — Communicating with the Golden Path

Downstream repos can **communicate back** to the golden-path source using the fleet feedback system (ADR-022, RN-052). This enables five types of structured feedback:

| Type | Use Case | Auto-Action |
|------|----------|-------------|
| `feature-request` | Request a new golden-path capability | Label + priority score |
| `bug-report` | Report an issue with a governed surface | Label + attach drift data |
| `policy-exception` | Request formal exception to a governance policy | Label + link to surface |
| `improvement-share` | Share a local improvement upstream for fleet-wide adoption | Auto-create draft PR |
| `pain-point` | Report friction with a governed surface | Label + aggregate frequency |

### Submitting Feedback (CLI)

```bash
# Preview feedback without submitting
pnpm fleet:feedback -- --type=feature-request --title="Add Vue a11y ESLint rules" \
  --description="Our team added accessibility linting rules that could benefit the fleet" --dry-run

# Submit feedback to upstream
pnpm fleet:feedback -- --type=feature-request --title="Add Vue a11y ESLint rules" \
  --description="Our team added accessibility linting rules that could benefit the fleet" --submit

# Share a local improvement (generates diff automatically)
pnpm fleet:feedback -- --type=improvement-share --surface=FLEET-SURF-005 \
  --file=eslint.config.js --submit
```

### Submitting Feedback (GitHub Action)

Use the `fleet-feedback` composite action in your workflow:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: your-org/ripple-next/.github/actions/fleet-feedback@v1
    with:
      feedback-type: 'feature-request'
      title: 'Add Vue a11y ESLint rules'
      description: 'Our team added accessibility linting rules that could benefit the fleet'
      feedback-token: ${{ secrets.FLEET_FEEDBACK_TOKEN }}
```

### Submitting Feedback (Reusable Workflow)

Use the reusable workflow for CI-integrated feedback:

```yaml
jobs:
  feedback:
    uses: your-org/ripple-next/.github/workflows/fleet-feedback-submit.yml@v1
    with:
      feedback-type: 'bug-report'
      title: 'Fleet drift detection false positive on SURF-005'
      description: 'ESLint config merge strategy reports drift for additive rule additions'
    secrets:
      FLEET_FEEDBACK_TOKEN: ${{ secrets.FLEET_FEEDBACK_TOKEN }}
```

### Token Setup

Fleet feedback requires a `FLEET_FEEDBACK_TOKEN` — a GitHub fine-grained personal access token with:
- **Repository access:** The upstream golden-path repo (e.g., `org/ripple-next`)
- **Permissions:** `Issues: Read and write`

Add this as a repository secret in your downstream repo.

### Reverse Sync (Improvement Sharing)

The `improvement-share` feedback type enables **true bidirectional sync**:

1. Your AI agent improves a governed/advisory file locally (e.g., adds a11y rules to `eslint.config.js`)
2. Run: `pnpm fleet:feedback -- --type=improvement-share --surface=FLEET-SURF-005 --file=eslint.config.js --submit`
3. The script reads `.fleet.json`, generates a unified diff, and submits as a structured issue
4. The upstream intake workflow validates the diff and auto-creates a draft PR if it applies cleanly
5. The golden-path team reviews and merges
6. The next fleet-sync run propagates the improvement to **all** downstream repos

This is the only template governance system that supports AI-assisted reverse sync — no other platform (Backstage, Cruft, Copier, Nx) provides this capability.

### Autonomous Improvement Detection

The scaffolded `fleet-feedback.yml` workflow includes a **monthly schedule** that:

1. Scans advisory-governed files (SURF-010: AI instructions) for local changes
2. Diffs them against the golden-path source
3. Auto-generates `improvement-share` feedback for local improvements
4. AI agents can run this autonomously to propose upstream contributions

### Related Error Codes

| Code | Meaning |
|------|---------|
| `RPL-FEEDBACK-001` | Feedback envelope validation failed |
| `RPL-FEEDBACK-002` | Duplicate feedback detected |
| `RPL-FEEDBACK-003` | Feedback submitted successfully |
| `RPL-FEEDBACK-004` | Feedback submission failed |

See `docs/error-taxonomy.json` for full remediation paths.

### Runbook

Run `pnpm runbook fleet-feedback-submit` for the full step-by-step procedure.

---

## Related Documentation

- [Reusable Composite Actions (RN-015)](./product-roadmap/ARCHIVE.md#rn-015-reusable-composite-actions)
- [Org-Wide Workflow Distribution (RN-026)](./product-roadmap/ARCHIVE.md#rn-026-org-wide-reusable-workflow-distribution)
- [CI Observability + Supply Chain (ADR-010)](./adr/010-ci-observability-supply-chain.md)
- [Flaky Test Containment (ADR-013)](./adr/013-flaky-test-containment.md)
- [Fleet Governance (ADR-019)](./adr/019-fleet-governance.md)
- [Bidirectional Fleet Communication (ADR-022)](./adr/022-bidirectional-fleet-communication.md)
- [Release Verification (RN-027)](./release-verification.md)
- [Code Generation Templates (RN-041)](./product-roadmap/ARCHIVE.md#rn-041-code-generation-templates)
- [Downstream Adoption Guide](./downstream-adoption-guide.md)
- [Platform Capabilities](./platform-capabilities.md)
