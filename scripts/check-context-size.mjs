#!/usr/bin/env node
/**
 * Context File Size Guard (ADR-020)
 *
 * Enforces line-count limits on CLAUDE.md and AGENTS.md to prevent
 * gradual re-bloat of agent context files. Based on empirical evidence
 * from arXiv:2602.11988 that over-specified context files reduce agent
 * task success rates while increasing inference cost.
 *
 * Usage:
 *   node scripts/check-context-size.mjs     # or: pnpm check:context-size
 *   node scripts/check-context-size.mjs --json  # machine-readable output
 *
 * Exit codes:
 *   0 — all files within limits
 *   1 — one or more files exceed hard limit (RPL-DOCS-002)
 *
 * Thresholds (non-blank, non-comment lines):
 *   CLAUDE.md: warn > 60, fail > 80
 *   AGENTS.md: warn > 220, fail > 280
 */
import { readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const jsonMode = process.argv.includes('--json')

const files = [
  { name: 'CLAUDE.md', warnAt: 60, failAt: 80 },
  { name: 'AGENTS.md', warnAt: 220, failAt: 280 },
]

const results = []
let hasError = false

for (const { name, warnAt, failAt } of files) {
  const content = readFileSync(join(ROOT, name), 'utf-8')
  const lines = content.split('\n').filter(
    (l) => l.trim() !== '' && !l.trim().startsWith('<!--') && !l.trim().startsWith('-->')
  ).length

  let status = 'pass'
  let taxonomyCode = null

  if (lines > failAt) {
    status = 'fail'
    taxonomyCode = 'RPL-DOCS-002'
    hasError = true
  } else if (lines > warnAt) {
    status = 'warn'
    taxonomyCode = 'RPL-DOCS-001'
  }

  results.push({ file: name, lines, warnAt, failAt, status, taxonomyCode })
}

if (jsonMode) {
  const report = {
    schema: 'ripple-context-size/v1',
    timestamp: new Date().toISOString(),
    results,
    overall: hasError ? 'fail' : 'pass',
  }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else {
  for (const r of results) {
    const icon = r.status === 'pass' ? '\u2705' : r.status === 'warn' ? '\u26A0\uFE0F' : '\u274C'
    const msg = `${icon} ${r.file}: ${r.lines} lines (warn: ${r.warnAt}, fail: ${r.failAt})`
    if (r.status === 'fail') {
      console.error(msg)
      console.error(`   ${r.taxonomyCode}: Exceeds hard limit. See ADR-020. Move content to .github/instructions/.`)
    } else if (r.status === 'warn') {
      console.warn(msg)
      console.warn(`   ${r.taxonomyCode}: Approaching limit. Review ADR-020 before adding more content.`)
    } else {
      console.info(msg)
    }
  }
}

process.exit(hasError ? 1 : 0)
