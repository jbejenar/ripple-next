# Downstream Workflow Consumption Guide

> How to use Ripple Next's reusable composite actions in your own repositories.

## Overview

Ripple Next provides three reusable composite actions in `.github/actions/` that
downstream repositories can reference for consistent CI setup:

| Action | Purpose | Key Features |
|--------|---------|--------------|
| `setup` | Node.js + pnpm installation | Frozen lockfile, caching, optional registry URL |
| `quality` | Lint, typecheck, policy gates | Readiness drift guard, quarantine check |
| `test` | Test execution + artifact upload | JUnit XML, coverage reports, 30-day retention |

## Prerequisites

- Your repository must use **pnpm** as its package manager
- Node.js 22 (default, configurable)
- The actions expect standard pnpm scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test:ci`

## Action Reference

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

### Minimal CI Workflow

A basic CI workflow that runs quality gates and tests on every PR:

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

### Recommended: Pin to a specific tag or SHA

For production stability, pin to a specific commit SHA or release tag:

```yaml
# Pin to a specific commit SHA (most stable)
- uses: your-org/ripple-next/.github/actions/setup@a1b2c3d

# Pin to a release tag (recommended)
- uses: your-org/ripple-next/.github/actions/setup@v1.0.0
```

### Acceptable: Pin to `main`

For repos that want to track the latest upstream changes:

```yaml
# Tracks latest — receives updates automatically
- uses: your-org/ripple-next/.github/actions/setup@main
```

### Not recommended: Using `latest` or floating tags

Avoid tags that can change unexpectedly. Always use deterministic references
to prevent CI breakage from upstream changes.

### Update Strategy

1. **Dependabot / Renovate**: Configure to track the composite action references
2. **Manual updates**: Periodically check for new releases and update your SHA pins
3. **Fleet sync** (RN-024): Automated fleet governance detects drift and opens sync PRs. See [ADR-019](./adr/019-fleet-governance.md) and the [fleet-drift workflow](../.github/workflows/fleet-drift.yml). Run `pnpm check:fleet-drift -- --target=/path/to/repo` to check a downstream repo manually

## Artifacts Produced

When using the `test` action with default settings, these artifacts are uploaded:

| Artifact | Contents | Retention |
|----------|----------|-----------|
| `test-results` | JUnit XML test reports | 30 days |
| `coverage-report` | JSON summary + text coverage | 30 days |

## Troubleshooting

### `pnpm: command not found`

Ensure the `setup` action runs before `quality` or `test`. The setup action
installs pnpm via `pnpm/action-setup@v4`.

### Lockfile conflicts

The setup action uses `--frozen-lockfile`. If you get lockfile errors, run
`pnpm install` locally and commit the updated `pnpm-lock.yaml`.

### Missing quality scripts

The `quality` action expects these pnpm scripts:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm check:readiness`
- `pnpm check:quarantine`

If your repo doesn't have all of these, add no-op scripts or use the actions
individually instead of the composite `quality` action.

## Related Documentation

- [Reusable Composite Actions (RN-015)](./product-roadmap/ARCHIVE.md#rn-015-reusable-composite-actions)
- [CI Observability + Supply Chain (ADR-010)](./adr/010-ci-observability-supply-chain.md)
- [Flaky Test Containment (ADR-013)](./adr/013-flaky-test-containment.md)
- [Org-Wide Workflow Distribution (RN-026)](./product-roadmap/README.md#rn-026-org-wide-reusable-workflow-distribution)
