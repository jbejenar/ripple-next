#!/usr/bin/env node
// ──────────────────────────────────────────────────────────────────────
// Runbook CLI — prints structured, executable runbook steps to stdout.
//
// Usage:
//   pnpm runbook <name>            # human-readable output
//   pnpm runbook <name> -- --json  # machine-readable JSON output
//   pnpm runbook --list            # list all available runbooks
//   pnpm runbook --list --json     # list runbooks as JSON
//
// Runbooks live in docs/runbooks/*.json. Each runbook contains:
//   - name, description
//   - preconditions (checks to run before starting)
//   - steps (ordered commands with descriptions)
//   - validation (postcondition checks)
//
// This script is read-only — it prints steps but does NOT execute them.
// Agents and humans read the output and execute steps themselves.
// ──────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const RUNBOOKS_DIR = join(__dirname, '..', 'docs', 'runbooks')

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const listMode = args.includes('--list')
const name = args.find((a) => !a.startsWith('--'))

function loadRunbooks() {
  const files = readdirSync(RUNBOOKS_DIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => {
    const content = readFileSync(join(RUNBOOKS_DIR, f), 'utf-8')
    return { file: f, ...JSON.parse(content) }
  })
}

function printList(runbooks) {
  if (jsonMode) {
    const list = runbooks.map((r) => ({
      name: r.name,
      description: r.description,
      file: `docs/runbooks/${r.file}`,
    }))
    process.stdout.write(JSON.stringify(list, null, 2) + '\n')
    return
  }

  process.stdout.write('Available runbooks:\n')
  process.stdout.write('───────────────────\n')
  for (const r of runbooks) {
    process.stdout.write(`  ${r.name.padEnd(24)} ${r.description}\n`)
  }
  process.stdout.write(
    `\nRun: pnpm runbook <name> to view a runbook's steps.\n`
  )
}

function printRunbook(runbook) {
  if (jsonMode) {
    const { file, ...data } = runbook
    process.stdout.write(JSON.stringify(data, null, 2) + '\n')
    return
  }

  process.stdout.write(`\n${runbook.name}\n`)
  process.stdout.write('═'.repeat(runbook.name.length) + '\n')
  process.stdout.write(`${runbook.description}\n`)

  if (runbook.args) {
    process.stdout.write('\nArguments:\n')
    for (const [key, desc] of Object.entries(runbook.args)) {
      process.stdout.write(`  ${key}: ${desc}\n`)
    }
  }

  if (runbook.preconditions?.length) {
    process.stdout.write('\nPreconditions:\n')
    for (const pre of runbook.preconditions) {
      process.stdout.write(`  ○ ${pre.description}\n`)
      process.stdout.write(`    $ ${pre.command}\n`)
    }
  }

  if (runbook.steps?.length) {
    process.stdout.write('\nSteps:\n')
    for (const step of runbook.steps) {
      process.stdout.write(`  ${step.order}. ${step.description}\n`)
      process.stdout.write(`     $ ${step.command}\n`)
    }
  }

  if (runbook.validation?.length) {
    process.stdout.write('\nValidation:\n')
    for (const v of runbook.validation) {
      process.stdout.write(`  ✓ ${v.description}\n`)
      process.stdout.write(`    $ ${v.command}\n`)
    }
  }

  if (runbook.postActions?.length) {
    process.stdout.write('\nPost-actions:\n')
    for (const action of runbook.postActions) {
      process.stdout.write(`  → ${action}\n`)
    }
  }

  if (runbook.related?.length) {
    process.stdout.write('\nRelated files:\n')
    for (const rel of runbook.related) {
      process.stdout.write(`  • ${rel}\n`)
    }
  }

  process.stdout.write('\n')
}

// ── Main ────────────────────────────────────────────────────────────

const runbooks = loadRunbooks()

if (listMode || !name) {
  printList(runbooks)
  process.exit(0)
}

const runbook = runbooks.find((r) => r.name === name)
if (!runbook) {
  process.stderr.write(`Error: runbook "${name}" not found.\n`)
  process.stderr.write(
    `Available: ${runbooks.map((r) => r.name).join(', ')}\n`
  )
  process.exit(1)
}

printRunbook(runbook)
