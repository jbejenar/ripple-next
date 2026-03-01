/**
 * Scaffold: CI/CD infrastructure.
 *
 * Generates GitHub Actions workflows, composite actions,
 * PR template, and CODEOWNERS.
 */
import { join } from 'node:path'
import { writeFileExternal } from '../lib.mjs'

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

  // ── .github/workflows/fleet-feedback.yml ────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'workflows', 'fleet-feedback.yml'),
    `name: Fleet Feedback

on:
  workflow_dispatch:
    inputs:
      feedback-type:
        required: true
        type: choice
        options:
          - feature-request
          - bug-report
          - policy-exception
          - improvement-share
          - pain-point
        description: 'Feedback type'
      title:
        required: true
        type: string
        description: 'Feedback title'
      description:
        required: true
        type: string
        description: 'Feedback description'
      surface-id:
        required: false
        type: string
        description: 'Governed surface ID (optional)'
  schedule:
    - cron: '0 3 1 * *' # Monthly — 1st of month, 3am UTC

jobs:
  manual-feedback:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - name: Submit feedback
        env:
          FLEET_FEEDBACK_TOKEN: \${{ secrets.FLEET_FEEDBACK_TOKEN }}
          INPUT_TYPE: \${{ github.event.inputs.feedback-type }}
          INPUT_SURFACE: \${{ github.event.inputs.surface-id }}
          INPUT_TITLE: \${{ github.event.inputs.title }}
          INPUT_DESCRIPTION: \${{ github.event.inputs.description }}
        run: |
          ARGS=(--type="\$INPUT_TYPE" --title="\$INPUT_TITLE" --description="\$INPUT_DESCRIPTION" --submit)
          if [ -n "\$INPUT_SURFACE" ]; then
            ARGS+=(--surface="\$INPUT_SURFACE")
          fi
          node scripts/fleet-feedback.mjs "\$\{ARGS[@]}"

  auto-improvement-scan:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - name: Check for fleet drift
        id: drift
        run: |
          echo "Checking for fleet drift and local improvements..."
          node scripts/check-fleet-drift.mjs --json > fleet-drift-report.json 2>/dev/null || true
          if [ -f fleet-drift-report.json ]; then
            echo "drift-report=true" >> "\$GITHUB_OUTPUT"
          fi
      - name: Report findings
        if: steps.drift.outputs.drift-report == 'true'
        run: |
          node -e "
            const r = JSON.parse(require('fs').readFileSync('fleet-drift-report.json','utf-8'));
            const drifted = (r.findings || []).filter(f => f.status === 'drifted' || f.status === 'missing');
            if (drifted.length > 0) {
              console.log('Fleet drift detected on ' + drifted.length + ' surface(s):');
              for (const f of drifted) console.log('  - ' + f.surfaceId + ': ' + f.name + ' (' + f.status + ')');
              console.log('Run: pnpm fleet:sync to apply updates, or submit improvements upstream.');
            } else {
              console.log('No fleet drift detected — repo is in sync with golden path.');
            }
          "
`,
    targetDir,
    opts
  )

  // ── .github/workflows/fleet-update.yml ──────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'workflows', 'fleet-update.yml'),
    `name: Fleet Update

on:
  repository_dispatch:
    types: [fleet-update-available]

permissions:
  issues: write

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create update awareness issue
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          VERSION: \${{ github.event.client_payload.version }}
          RELEASE_URL: \${{ github.event.client_payload.release_url }}
        run: |
          BODY="## Golden Path Update Available

**Version:** \${VERSION}
**Release:** \${RELEASE_URL}

### What to do

1. Review the release notes and changelog
2. Run \`pnpm check:fleet-drift\` to see what changed
3. Run \`pnpm fleet:sync\` to apply updates
4. Review and merge the sync PR

---
*Created automatically by fleet-update notification (ADR-022)*"

          gh issue create \\
            --title "Fleet Update: Golden path \${VERSION} available" \\
            --body "\$BODY" \\
            --label "fleet:update"
`,
    targetDir,
    opts
  )
}
