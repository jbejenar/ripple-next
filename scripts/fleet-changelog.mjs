#!/usr/bin/env node
/**
 * Fleet Changelog Generator — RN-052, ADR-022
 *
 * Generates or validates docs/fleet-changelog.json from git tag annotations.
 * Provides machine-readable changelog for AI agent consumption in downstream repos.
 *
 * Usage:
 *   pnpm fleet:changelog                    # display current changelog
 *   pnpm fleet:changelog -- --json          # JSON output
 *   pnpm fleet:changelog -- --validate      # validate changelog structure
 *
 * Exit codes:
 *   0 — success
 *   1 — validation error or missing changelog
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CHANGELOG_PATH = resolve(ROOT, 'docs/fleet-changelog.json')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const validateMode = args.includes('--validate')

// ── Load changelog ───────────────────────────────────────────────────
if (!existsSync(CHANGELOG_PATH)) {
  console.error('Error: docs/fleet-changelog.json not found')
  console.error('Create it manually or run fleet governance setup.')
  process.exit(1)
}

let changelog
try {
  changelog = JSON.parse(readFileSync(CHANGELOG_PATH, 'utf-8'))
} catch {
  console.error('Error: docs/fleet-changelog.json is not valid JSON')
  process.exit(1)
}

// ── Validate structure ───────────────────────────────────────────────
const errors = []

if (changelog.schema !== 'ripple-fleet-changelog/v1') {
  errors.push('Missing or invalid schema field (expected "ripple-fleet-changelog/v1")')
}

if (!Array.isArray(changelog.entries)) {
  errors.push('Missing or invalid entries array')
} else {
  for (const [i, entry] of changelog.entries.entries()) {
    if (!entry.version) errors.push(`Entry ${i}: missing version`)
    if (!entry.date) errors.push(`Entry ${i}: missing date`)
    if (!entry.summary) errors.push(`Entry ${i}: missing summary`)
    if (!Array.isArray(entry.changes)) {
      errors.push(`Entry ${i}: missing or invalid changes array`)
    } else {
      for (const [j, change] of entry.changes.entries()) {
        if (!change.type) errors.push(`Entry ${i}, change ${j}: missing type`)
        if (!change.description) errors.push(`Entry ${i}, change ${j}: missing description`)
      }
    }
  }
}

if (validateMode) {
  const result = {
    schema: 'ripple-fleet-changelog-validation/v1',
    valid: errors.length === 0,
    errors,
    entryCount: changelog.entries?.length ?? 0,
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  } else {
    if (result.valid) {
      console.error('Fleet changelog is valid.')
      console.error(`  Entries: ${result.entryCount}`)
    } else {
      console.error('Fleet changelog validation failed:')
      for (const err of errors) {
        console.error(`  - ${err}`)
      }
    }
  }

  process.exit(result.valid ? 0 : 1)
}

// ── Display changelog ────────────────────────────────────────────────
if (errors.length > 0) {
  console.error('Warning: changelog has structural issues:')
  for (const err of errors) {
    console.error(`  - ${err}`)
  }
  console.error('')
}

if (jsonMode) {
  process.stdout.write(JSON.stringify(changelog, null, 2) + '\n')
} else {
  console.error('')
  console.error('Fleet Changelog — RN-052')
  console.error('\u2500'.repeat(40))

  if (!changelog.entries || changelog.entries.length === 0) {
    console.error('\n  No changelog entries.\n')
  } else {
    for (const entry of changelog.entries) {
      console.error(`\n  v${entry.version} (${entry.date})`)
      console.error(`  ${entry.summary}`)
      console.error('')

      if (entry.changes) {
        for (const change of entry.changes) {
          const prefix = change.type === 'breaking' ? '\u26A0' : '\u2022'
          console.error(`    ${prefix} [${change.type}] ${change.description}`)
        }
      }

      if (entry.upgradeActions && entry.upgradeActions.length > 0) {
        console.error('\n    Upgrade actions:')
        for (const action of entry.upgradeActions) {
          console.error(`      \u2192 ${action}`)
        }
      }
    }
  }

  console.error('')
  console.error('\u2500'.repeat(40))
  console.error(`Total entries: ${changelog.entries?.length ?? 0}`)
  console.error('')
}
