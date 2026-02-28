#!/usr/bin/env node
/**
 * Unified Quality Gate Runner — Machine-Readable Summaries
 *
 * Runs all quality gates in sequence and emits a structured summary.
 * Implements RN-034: Machine-Readable Quality Gate Summaries.
 *
 * Usage:
 *   pnpm verify                   # human-readable output
 *   pnpm verify -- --json         # JSON summary to stdout
 *   pnpm verify -- --ci           # write gate-summary.json for artifact upload
 *   pnpm verify -- --output=path  # write JSON to a specific file
 *   pnpm verify -- --fleet        # include fleet drift gate (RN-024)
 *
 * Exit codes:
 *   0 — all gates passed
 *   1 — one or more gates failed
 *
 * JSON Schema (ripple-gate-summary/v1):
 *   {
 *     "schema":      "ripple-gate-summary/v1",
 *     "timestamp":   "ISO-8601 datetime",
 *     "status":      "pass" | "fail",
 *     "passed":      <int>,
 *     "failed":      <int>,
 *     "total":       <int>,
 *     "duration_ms": <int>,
 *     "gates": [
 *       {
 *         "gate":        "<gate name>",
 *         "category":    "environment" | "quality" | "tests" | "policy",
 *         "status":      "pass" | "fail",
 *         "exitCode":    <int>,
 *         "duration_ms": <int>
 *       }
 *     ]
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const fleetMode = args.includes('--fleet')
const outputArg = args.find((a) => a.startsWith('--output='))
const outputFile = outputArg ? outputArg.split('=')[1] : null

// ── Gate definitions (execution order matters) ───────────────────────
const GATES = [
  { name: 'validate:env', args: ['pnpm', 'validate:env'], category: 'environment' },
  { name: 'lint', args: ['pnpm', 'lint'], category: 'quality' },
  { name: 'typecheck', args: ['pnpm', 'typecheck'], category: 'quality' },
  { name: 'test', args: ['pnpm', 'test'], category: 'tests' },
  { name: 'check:readiness', args: ['pnpm', 'check:readiness'], category: 'policy' },
  { name: 'check:quarantine', args: ['pnpm', 'check:quarantine'], category: 'policy' },
  { name: 'check:iac', args: ['pnpm', 'check:iac'], category: 'policy' },
  { name: 'check:context-size', args: ['pnpm', 'check:context-size'], category: 'policy' },
  { name: 'check:api-contract', args: ['pnpm', 'check:api-contract'], category: 'policy' },
]

// Add fleet drift gate if --fleet flag is passed and fleet-policy.json exists
if (fleetMode && existsSync(resolve(ROOT, 'docs/fleet-policy.json'))) {
  GATES.push({ name: 'check:fleet-drift', args: ['pnpm', 'check:fleet-drift'], category: 'fleet' })
}

// ── Gate runner ──────────────────────────────────────────────────────
function runGate(gate) {
  const start = Date.now()
  let exitCode = 0

  try {
    execFileSync(gate.args[0], gate.args.slice(1), {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300_000,
      cwd: ROOT,
    })
  } catch (err) {
    exitCode = err.status ?? 1
  }

  return {
    gate: gate.name,
    category: gate.category,
    status: exitCode === 0 ? 'pass' : 'fail',
    exitCode,
    duration_ms: Date.now() - start,
  }
}

// ── Run all gates ────────────────────────────────────────────────────
const results = []
const totalStart = Date.now()

for (const gate of GATES) {
  if (!jsonMode) {
    process.stdout.write(`  Running ${gate.name}...`)
  }

  const result = runGate(gate)
  results.push(result)

  if (!jsonMode) {
    const icon = result.status === 'pass' ? '\u2713' : '\u2717'
    const secs = (result.duration_ms / 1000).toFixed(1)
    process.stdout.write(` ${icon} (${secs}s)\n`)
  }
}

const totalDuration = Date.now() - totalStart
const passed = results.filter((r) => r.status === 'pass').length
const failed = results.filter((r) => r.status === 'fail').length
const overallStatus = failed === 0 ? 'pass' : 'fail'

// ── Build summary object ─────────────────────────────────────────────
const summary = {
  schema: 'ripple-gate-summary/v1',
  timestamp: new Date().toISOString(),
  status: overallStatus,
  passed,
  failed,
  total: results.length,
  duration_ms: totalDuration,
  gates: results,
}

// ── Output ───────────────────────────────────────────────────────────
if (jsonMode) {
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n')
} else {
  const totalSecs = (totalDuration / 1000).toFixed(1)
  console.log()
  console.log('Quality Gate Summary')
  console.log('\u2500'.repeat(40))
  for (const r of results) {
    const icon = r.status === 'pass' ? '\u2713' : '\u2717'
    const secs = (r.duration_ms / 1000).toFixed(1)
    console.log(`  ${icon} ${r.gate} (${secs}s)`)
  }
  console.log()
  console.log(`Results: ${passed} passed, ${failed} failed (${totalSecs}s total)`)
  console.log(`Status: ${overallStatus}`)
}

// ── Write JSON to file if requested ──────────────────────────────────
const writePath = outputFile || (ciMode ? resolve(ROOT, 'gate-summary.json') : null)

if (writePath) {
  const absPath = resolve(ROOT, writePath)
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, JSON.stringify(summary, null, 2) + '\n')
  if (!jsonMode) {
    console.log(`\nGate summary written to: ${absPath}`)
  }
}

// ── Exit with non-zero if any gate failed ────────────────────────────
process.exit(failed > 0 ? 1 : 0)
