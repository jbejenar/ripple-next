#!/usr/bin/env node
/**
 * Quarantine Health Check — validates flaky test quarantine policy (ADR-013).
 *
 * Scans all test files for quarantined tests and enforces:
 *   1. Maximum quarantine duration (14 days)
 *   2. Maximum quarantine budget (5% of total tests)
 *   3. Mandatory issue linkage
 *   4. No quarantine in Tier 1 packages (auth, db, queue)
 *
 * Usage:
 *   pnpm check:quarantine            # human-readable output
 *   pnpm check:quarantine -- --json  # machine-readable JSON
 *
 * Exit codes:
 *   0 — quarantine policy satisfied
 *   1 — policy violations found
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const JSON_MODE = process.argv.includes('--json')
const MAX_QUARANTINE_DAYS = 14
const MAX_QUARANTINE_PERCENT = 5
const TIER1_PATHS = ['packages/auth', 'packages/db', 'packages/queue']
const TEST_EXTENSIONS = ['.test.ts', '.test.js', '.spec.ts', '.spec.js']

const rootDir = new URL('..', import.meta.url).pathname.replace(/\/$/, '')

/** Recursively find test files */
async function findTestFiles(dir) {
  const results = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.name === 'node_modules' || entry.name === '.nuxt' || entry.name === 'dist') continue
    if (entry.isDirectory()) {
      results.push(...await findTestFiles(fullPath))
    } else if (TEST_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath)
    }
  }
  return results
}

/** Parse quarantine annotations from a test file */
async function parseQuarantines(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const quarantines = []

  // Match describe.skip('flaky: ...') or test.skip('flaky: ...') or it.skip('flaky: ...')
  const skipPattern = /(?:describe|test|it)\.skip\s*\(\s*['"`]flaky:\s*(.+?)['"`]/g
  let match
  while ((match = skipPattern.exec(content)) !== null) {
    const label = match[1]
    const contextStart = Math.max(0, match.index - 200)
    const contextEnd = Math.min(content.length, match.index + match[0].length + 500)
    const context = content.slice(contextStart, contextEnd)

    const dateMatch = context.match(/QUARANTINE_DATE:\s*(\d{4}-\d{2}-\d{2})/)
    const issueMatch = context.match(/QUARANTINED:\s*(https?:\/\/\S+)/)
    const reasonMatch = context.match(/REASON:\s*(.+)/)

    quarantines.push({
      file: relative(rootDir, filePath),
      label: label.trim(),
      date: dateMatch ? dateMatch[1] : null,
      issue: issueMatch ? issueMatch[1] : null,
      reason: reasonMatch ? reasonMatch[1].trim() : null,
    })
  }

  return quarantines
}

/** Count total test cases (approximate — counts describe/test/it calls) */
async function countTests(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const testPattern = /(?:^|\s)(?:test|it)\s*\(/gm
  const matches = content.match(testPattern)
  return matches ? matches.length : 0
}

async function main() {
  const testFiles = await findTestFiles(rootDir)
  const allQuarantines = []
  let totalTests = 0

  for (const file of testFiles) {
    const quarantines = await parseQuarantines(file)
    allQuarantines.push(...quarantines)
    totalTests += await countTests(file)
  }

  const now = new Date()
  const violations = []

  for (const q of allQuarantines) {
    // Check mandatory issue linkage
    if (!q.issue) {
      violations.push({
        type: 'missing-issue',
        file: q.file,
        label: q.label,
        message: `Quarantined test "${q.label}" in ${q.file} missing QUARANTINED issue link`,
      })
    }

    // Check mandatory date
    if (!q.date) {
      violations.push({
        type: 'missing-date',
        file: q.file,
        label: q.label,
        message: `Quarantined test "${q.label}" in ${q.file} missing QUARANTINE_DATE`,
      })
    }

    // Check expiration
    if (q.date) {
      const quarantineDate = new Date(q.date)
      const daysSince = Math.floor((now - quarantineDate) / (1000 * 60 * 60 * 24))
      if (daysSince > MAX_QUARANTINE_DAYS) {
        violations.push({
          type: 'expired',
          file: q.file,
          label: q.label,
          days: daysSince,
          message: `Quarantined test "${q.label}" in ${q.file} expired (${daysSince} days, max ${MAX_QUARANTINE_DAYS})`,
        })
      }
    }

    // Check Tier 1 restriction
    if (TIER1_PATHS.some(p => q.file.startsWith(p))) {
      violations.push({
        type: 'tier1-quarantine',
        file: q.file,
        label: q.label,
        message: `Tier 1 test "${q.label}" in ${q.file} may NOT be quarantined — fix immediately or revert`,
      })
    }
  }

  // Check budget
  const quarantinePercent = totalTests > 0 ? (allQuarantines.length / totalTests) * 100 : 0
  if (quarantinePercent > MAX_QUARANTINE_PERCENT) {
    violations.push({
      type: 'budget-exceeded',
      quarantined: allQuarantines.length,
      total: totalTests,
      percent: quarantinePercent.toFixed(1),
      message: `Quarantine budget exceeded: ${allQuarantines.length}/${totalTests} (${quarantinePercent.toFixed(1)}%, max ${MAX_QUARANTINE_PERCENT}%)`,
    })
  }

  const result = {
    valid: violations.length === 0,
    quarantined: allQuarantines.length,
    totalTests,
    budgetPercent: quarantinePercent.toFixed(1),
    maxBudgetPercent: MAX_QUARANTINE_PERCENT,
    maxDays: MAX_QUARANTINE_DAYS,
    quarantines: allQuarantines,
    violations,
  }

  if (JSON_MODE) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  } else {
    if (allQuarantines.length === 0) {
      process.stdout.write('Quarantine check: no quarantined tests found.\n')
    } else {
      process.stdout.write(`Quarantine check: ${allQuarantines.length} quarantined test(s) (${quarantinePercent.toFixed(1)}% of ${totalTests} total)\n\n`)
      for (const q of allQuarantines) {
        process.stdout.write(`  - ${q.file}: "${q.label}" (${q.date || 'no date'}) ${q.issue || 'NO ISSUE LINK'}\n`)
      }
    }

    if (violations.length > 0) {
      process.stderr.write(`\nViolations (${violations.length}):\n`)
      for (const v of violations) {
        process.stderr.write(`  ERROR: ${v.message}\n`)
      }
    } else {
      process.stdout.write('\nAll quarantine policy checks passed.\n')
    }
  }

  process.exit(violations.length > 0 ? 1 : 0)
}

main()
