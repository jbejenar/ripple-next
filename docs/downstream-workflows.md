# Downstream Workflow Consumption Guide

> How to use Ripple Next's reusable workflows and composite actions in downstream repositories.

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
| `setup` | Node.js + pnpm installation | Frozen lockfile, caching, optional registry URL |
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
  - uses: your-org/ripple-next/.github/actions/setup@main
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
  - uses: your-org/ripple-next/.github/actions/setup@main
  - uses: your-org/ripple-next/.github/actions/quality@main
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
  - uses: your-org/ripple-next/.github/actions/setup@main
  - uses: your-org/ripple-next/.github/actions/test@main
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
      - uses: your-org/ripple-next/.github/actions/setup@main
      - uses: your-org/ripple-next/.github/actions/quality@main
      - uses: your-org/ripple-next/.github/actions/test@main
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
      - uses: your-org/ripple-next/.github/actions/setup@main
      - uses: your-org/ripple-next/.github/actions/quality@main

  # Tier 1: Unit tests on every PR
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@main
      - uses: your-org/ripple-next/.github/actions/test@main

  # Tier 2: E2E tests on merge to main only
  e2e:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/ripple-next/.github/actions/setup@main
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
      - uses: your-org/ripple-next/.github/actions/setup@main
        with:
          registry-url: 'https://npm.pkg.github.com'
      - uses: your-org/ripple-next/.github/actions/quality@main
      - uses: your-org/ripple-next/.github/actions/test@main
      - run: pnpm publish --access restricted
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

This generates ~30 files across 5 categories:

| Category | What's Generated |
|----------|-----------------|
| AI / Agent DX | `CLAUDE.md`, `AGENTS.md`, `.github/agents/`, `.github/instructions/`, `.github/prompts/`, Copilot instructions |
| Documentation | `docs/readiness.json`, `docs/error-taxonomy.json`, ADR index, runbook templates, product roadmap template |
| Quality Gates | `scripts/verify.mjs`, `scripts/doctor.sh`, `scripts/check-readiness.mjs`, `scripts/validate-env.mjs` |
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

## Related Documentation

- [Reusable Composite Actions (RN-015)](./product-roadmap/ARCHIVE.md#rn-015-reusable-composite-actions)
- [Org-Wide Workflow Distribution (RN-026)](./product-roadmap/README.md#rn-026-org-wide-reusable-workflow-distribution)
- [CI Observability + Supply Chain (ADR-010)](./adr/010-ci-observability-supply-chain.md)
- [Flaky Test Containment (ADR-013)](./adr/013-flaky-test-containment.md)
- [Fleet Governance (ADR-019)](./adr/019-fleet-governance.md)
- [Release Verification (RN-027)](./release-verification.md)
- [Code Generation Templates (RN-041)](./product-roadmap/README.md#rn-041-code-generation-templates)
