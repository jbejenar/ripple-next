/**
 * Scaffold: CI/CD infrastructure.
 *
 * Generates GitHub Actions workflows, composite actions,
 * PR template, and CODEOWNERS.
 */
import { join } from 'node:path'
import { writeFileExternal, copyFileFromSource } from '../lib.mjs'

export function scaffoldCi(targetDir, config, options = {}) {
  const { name, org } = config
  const opts = { dryRun: options.dryRun, force: options.force }

  console.log('\n  CI / CD')
  console.log('  ' + '─'.repeat(30))

  // ── .github/workflows/ci.yml ──────────────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'workflows', 'ci.yml'),
    `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup

  quality:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - uses: ./.github/actions/quality

  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - uses: ./.github/actions/test
`,
    targetDir,
    opts
  )

  // ── .github/workflows/security.yml ────────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'workflows', 'security.yml'),
    `name: Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am UTC

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - name: Audit dependencies
        run: pnpm audit --audit-level=high
      - name: Check for known vulnerabilities
        run: npx better-npm-audit audit --level high
`,
    targetDir,
    opts
  )

  // ── Composite actions ─────────────────────────────────────────────

  // setup action
  writeFileExternal(
    join(targetDir, '.github', 'actions', 'setup', 'action.yml'),
    `name: Setup
description: Install Node.js and pnpm, restore cache

runs:
  using: composite
  steps:
    - name: Read .nvmrc
      id: nvmrc
      shell: bash
      run: echo "version=\$(cat .nvmrc)" >> "$GITHUB_OUTPUT"

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ steps.nvmrc.outputs.version }}

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Get pnpm store directory
      id: pnpm-cache
      shell: bash
      run: echo "store=\$(pnpm store path)" >> "$GITHUB_OUTPUT"

    - name: Cache pnpm store
      uses: actions/cache@v4
      with:
        path: \${{ steps.pnpm-cache.outputs.store }}
        key: pnpm-\${{ runner.os }}-\${{ hashFiles('pnpm-lock.yaml') }}
        restore-keys: pnpm-\${{ runner.os }}-

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile
`,
    targetDir,
    opts
  )

  // quality action
  writeFileExternal(
    join(targetDir, '.github', 'actions', 'quality', 'action.yml'),
    `name: Quality Gates
description: Run lint, typecheck, and readiness checks

runs:
  using: composite
  steps:
    - name: Lint
      shell: bash
      run: pnpm lint

    - name: Type check
      shell: bash
      run: pnpm typecheck

    - name: Readiness check
      shell: bash
      run: node scripts/check-readiness.mjs
`,
    targetDir,
    opts
  )

  // test action
  writeFileExternal(
    join(targetDir, '.github', 'actions', 'test', 'action.yml'),
    `name: Test
description: Run the full test suite

runs:
  using: composite
  steps:
    - name: Run tests
      shell: bash
      run: pnpm test
`,
    targetDir,
    opts
  )

  // ── .github/pull_request_template.md ──────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'pull_request_template.md'),
    `## Summary

<!-- Describe what this PR does and why -->

## Changes

-

## Test Plan

- [ ] All tests pass (\`pnpm test\`)
- [ ] Lint clean (\`pnpm lint\`)
- [ ] Types check (\`pnpm typecheck\`)
- [ ] Readiness manifest updated (if subsystem changed)
- [ ] Documentation updated (if API or behavior changed)

## Related Issues

<!-- Link to related issues: Fixes #123, Closes #456 -->
`,
    targetDir,
    opts
  )

  // ── .github/CODEOWNERS ────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'CODEOWNERS'),
    `# CODEOWNERS for ${name}
# See: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Default owners for everything
* @${org}/engineering

# CI/CD configuration
.github/ @${org}/platform

# Security-sensitive files
.env.example @${org}/security
scripts/ @${org}/platform
`,
    targetDir,
    opts
  )
}
