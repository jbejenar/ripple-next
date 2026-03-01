#!/usr/bin/env node
/**
 * Readiness Drift Guard
 *
 * Validates that docs/readiness.json claims are backed by evidence in the
 * codebase. Fails fast when status claims become stale.
 *
 * Usage:
 *   node scripts/check-readiness.mjs   # or: pnpm check:readiness
 *
 * Exit codes:
 *   0 — all claims verified
 *   1 — one or more drift issues found
 *
 * What it checks:
 *   - "implemented" subsystems must have at least one test file
 *   - Packages referenced in readiness.json must exist on disk
 *   - Paths referenced must exist
 *   - CI workflow files must exist if ci is "implemented"
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const readiness = JSON.parse(readFileSync(join(ROOT, 'docs/readiness.json'), 'utf-8'))

let pass = 0
let fail = 0
const issues = []

function ok(msg) {
  pass++
  console.log(`  ✓ ${msg}`)
}

function bad(msg) {
  fail++
  issues.push(msg)
  console.error(`  ✗ ${msg}`)
}

/**
 * Recursively find files matching a pattern in a directory.
 */
function findFiles(dir, pattern) {
  if (!existsSync(dir)) return []
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findFiles(full, pattern))
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(full)
    }
  }
  return results
}

console.log('Readiness Drift Guard')
console.log('─────────────────────')
console.log()

const { subsystems } = readiness

for (const [name, sub] of Object.entries(subsystems)) {
  console.log(`[${name}]`)

  // Check referenced packages exist (skip for "planned" subsystems — they don't exist yet)
  if (sub.packages?.length > 0 && sub.status !== 'planned') {
    for (const pkg of sub.packages) {
      if (pkg === 'all @ripple-next/* packages') {
        // Special case for publishing subsystem
        const pkgDirs = readdirSync(join(ROOT, 'packages'))
        if (pkgDirs.length > 0) {
          ok(`packages/ directory has ${pkgDirs.length} packages`)
        } else {
          bad(`${name}: "all @ripple-next/* packages" referenced but packages/ is empty`)
        }
        continue
      }

      const pkgName = pkg.replace('@ripple-next/', '')
      const pkgDir = join(ROOT, 'packages', pkgName)
      if (existsSync(pkgDir)) {
        ok(`package ${pkg} exists`)
      } else {
        bad(`${name}: package ${pkg} referenced but ${pkgDir} does not exist`)
      }
    }
  }

  // Check referenced paths exist (skip for "planned" subsystems)
  if (sub.paths?.length > 0 && sub.status !== 'planned') {
    for (const p of sub.paths) {
      const fullPath = join(ROOT, p)
      if (existsSync(fullPath)) {
        ok(`path ${p} exists`)
      } else {
        bad(`${name}: path ${p} referenced but does not exist`)
      }
    }
  }

  // "implemented" subsystems with packages must have tests
  // Exception: packages whose testCoverage explains they're tested indirectly
  const indirectTestPatterns = ['conformance-suites-used-by-providers', 'self-tested']
  if (sub.status === 'implemented' && sub.packages?.length > 0 && !indirectTestPatterns.includes(sub.testCoverage)) {
    for (const pkg of sub.packages) {
      if (pkg === 'all @ripple-next/* packages') continue

      const pkgName = pkg.replace('@ripple-next/', '')
      const pkgDir = join(ROOT, 'packages', pkgName)
      const testFiles = findFiles(pkgDir, /\.(test|spec)\.(ts|js)$/)

      if (testFiles.length > 0) {
        ok(`${pkg} has ${testFiles.length} test file(s)`)
      } else if (sub.testCoverage === 'minimal') {
        ok(`${pkg} has no test files (acknowledged as "minimal" coverage)`)
      } else {
        bad(`${name}: ${pkg} is "implemented" but has zero test files`)
      }
    }
  }

  // "implemented" status with testCoverage "none" is a contradiction
  if (sub.status === 'implemented' && sub.testCoverage === 'none') {
    bad(`${name}: status is "implemented" but testCoverage is "none" — either add tests or downgrade status`)
  }

  // CI subsystem: verify workflow files exist
  if (name === 'ci' && sub.status === 'implemented') {
    const workflowDir = join(ROOT, '.github/workflows')
    if (existsSync(workflowDir)) {
      const workflows = readdirSync(workflowDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
      if (workflows.length > 0) {
        ok(`${workflows.length} CI workflow file(s) found`)
      } else {
        bad('ci: "implemented" but no .yml/.yaml workflow files in .github/workflows/')
      }
    } else {
      bad('ci: "implemented" but .github/workflows/ directory does not exist')
    }
  }

  // Check for stale blockers: if a blocker mentions something that's been resolved
  if (sub.blockers?.length > 0) {
    for (const blocker of sub.blockers) {
      // Specific drift detection for known resolved items
      if (blocker.toLowerCase().includes('no contract tests') && name === 'api') {
        const apiTests = findFiles(join(ROOT, 'apps/web/tests'), /\.(test|spec)\.(ts|js)$/)
        if (apiTests.length > 0) {
          bad(`${name}: blocker "${blocker}" may be stale — found ${apiTests.length} test file(s) in apps/web/tests/`)
        }
      }
      if (blocker.toLowerCase().includes('no release ci workflow') && name === 'publishing') {
        if (existsSync(join(ROOT, '.github/workflows/release.yml'))) {
          bad(`${name}: blocker "${blocker}" is stale — .github/workflows/release.yml exists`)
        }
      }
      if (blocker.toLowerCase().includes('no changeset') && name === 'publishing') {
        if (existsSync(join(ROOT, '.changeset/config.json'))) {
          bad(`${name}: blocker "${blocker}" is stale — .changeset/config.json exists`)
        }
      }
    }
  }

  console.log()
}

// ── Summary ──────────────────────────────────────────────────────────
console.log('─────────────────────')
console.log(`Results: ${pass} passed, ${fail} drift issue(s)`)

if (fail > 0) {
  console.log()
  console.log('Drift issues found — update docs/readiness.json to match reality:')
  for (const issue of issues) {
    console.log(`  → ${issue}`)
  }
  process.exit(1)
}

console.log()
console.log('Readiness manifest is consistent.')
process.exit(0)
