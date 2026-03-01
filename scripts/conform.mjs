#!/usr/bin/env node
/**
 * Golden-Path Conformance CLI — RN-028
 *
 * Scores a repository against the golden-path conformance rubric defined
 * in docs/conformance-rubric.json. Each check evaluates a specific standard
 * (file existence, JSON field, script, gitignore pattern) and contributes
 * weighted points to a total score out of 100.
 *
 * Usage:
 *   pnpm conform                          # score self (golden-path)
 *   pnpm conform -- --target /path/to/repo # score a downstream repo
 *   pnpm conform -- --json                 # JSON report to stdout
 *   pnpm conform -- --ci                   # write conformance-report.json
 *   pnpm conform -- --output=path          # write JSON to a specific file
 *
 * Exit codes:
 *   0 — score meets or exceeds passing threshold
 *   1 — score below passing threshold
 *
 * JSON Schema (ripple-conformance/v1):
 *   {
 *     "schema":        "ripple-conformance/v1",
 *     "timestamp":     "ISO-8601",
 *     "targetPath":    "path to scored repo",
 *     "score":         0-100,
 *     "maxScore":      100,
 *     "passingScore":  70,
 *     "status":        "pass" | "fail",
 *     "categories":    [...],
 *     "findings":      [...],
 *     "summary":       { total, passed, failed, score, maxScore }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const RUBRIC_PATH = resolve(ROOT, 'docs/conformance-rubric.json')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const outputArg = args.find((a) => a.startsWith('--output='))
const targetArg = args.find((a) => a.startsWith('--target='))
const targetPath = targetArg ? resolve(targetArg.split('=')[1]) : ROOT

// ── Load rubric ──────────────────────────────────────────────────────
let rubric
try {
  rubric = JSON.parse(readFileSync(RUBRIC_PATH, 'utf-8'))
} catch {
  const errorReport = buildErrorReport(
    'RPL-CONFORM-001',
    'Conformance rubric missing or invalid (docs/conformance-rubric.json)'
  )
  outputReport(errorReport)
  process.exit(1)
}

// ── Check implementations ────────────────────────────────────────────

function checkFileExists(check) {
  const filePath = join(targetPath, check.path)
  return existsSync(filePath)
}

function checkFileExistsAny(check) {
  return check.paths.some((p) => existsSync(join(targetPath, p)))
}

function checkJsonField(check) {
  const filePath = join(targetPath, check.path)
  if (!existsSync(filePath)) return false
  try {
    const json = JSON.parse(readFileSync(filePath, 'utf-8'))
    const value = json[check.field]
    return value !== undefined && value !== null && value !== ''
  } catch {
    return false
  }
}

function checkScriptExists(check) {
  const pkgPath = join(targetPath, 'package.json')
  if (!existsSync(pkgPath)) return false
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return Boolean(pkg.scripts && pkg.scripts[check.script])
  } catch {
    return false
  }
}

function checkFileNotTracked(check) {
  const gitignorePath = join(targetPath, check.gitignorePath)
  if (!existsSync(gitignorePath)) return false
  try {
    const content = readFileSync(gitignorePath, 'utf-8')
    const lines = content.split('\n').map((l) => l.trim())
    const re = new RegExp(check.pattern)
    return lines.some((line) => re.test(line))
  } catch {
    return false
  }
}

const CHECK_RUNNERS = {
  'file-exists': checkFileExists,
  'file-exists-any': checkFileExistsAny,
  'json-field': checkJsonField,
  'script-exists': checkScriptExists,
  'file-not-tracked': checkFileNotTracked,
}

// ── Run conformance checks ───────────────────────────────────────────
const findings = []
const categoryResults = []

for (const category of rubric.categories) {
  let categoryScore = 0
  let categoryMax = 0

  for (const check of category.checks) {
    categoryMax += check.points
    const runner = CHECK_RUNNERS[check.type]

    if (!runner) {
      findings.push({
        checkId: check.id,
        category: category.id,
        description: check.description,
        status: 'fail',
        points: 0,
        maxPoints: check.points,
        taxonomyCode: 'RPL-CONFORM-002',
        details: `Unknown check type: ${check.type}`,
        remediation: check.remediation,
      })
      continue
    }

    const passed = runner(check)

    if (passed) {
      categoryScore += check.points
    }

    findings.push({
      checkId: check.id,
      category: category.id,
      description: check.description,
      status: passed ? 'pass' : 'fail',
      points: passed ? check.points : 0,
      maxPoints: check.points,
      taxonomyCode: passed ? null : 'RPL-CONFORM-002',
      details: passed ? 'Check passed' : `Missing: ${check.description}`,
      remediation: passed ? null : check.remediation,
    })
  }

  categoryResults.push({
    id: category.id,
    name: category.name,
    score: categoryScore,
    maxScore: categoryMax,
    percentage: categoryMax > 0 ? Math.round((categoryScore / categoryMax) * 100) : 100,
  })
}

// ── Calculate total score ────────────────────────────────────────────
const totalScore = findings.reduce((sum, f) => sum + f.points, 0)
const totalMax = findings.reduce((sum, f) => sum + f.maxPoints, 0)
const totalPassed = findings.filter((f) => f.status === 'pass').length
const totalFailed = findings.filter((f) => f.status === 'fail').length
const passingScore = rubric.passingScore
const overallStatus = totalScore >= passingScore ? 'pass' : 'fail'

// ── Build report ─────────────────────────────────────────────────────
const report = {
  schema: 'ripple-conformance/v1',
  timestamp: new Date().toISOString(),
  targetPath: targetPath === ROOT ? '(self — golden path)' : targetPath,
  score: totalScore,
  maxScore: totalMax,
  passingScore,
  status: overallStatus,
  categories: categoryResults,
  findings,
  summary: {
    total: findings.length,
    passed: totalPassed,
    failed: totalFailed,
    score: totalScore,
    maxScore: totalMax,
  },
}

// ── Output ───────────────────────────────────────────────────────────
outputReport(report)
process.exit(overallStatus === 'fail' ? 1 : 0)

// ── Output helpers ───────────────────────────────────────────────────
function outputReport(rpt) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify(rpt, null, 2) + '\n')
  }

  if (ciMode || outputArg) {
    const outPath = outputArg
      ? resolve(ROOT, outputArg.split('=')[1])
      : resolve(ROOT, 'conformance-report.json')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(rpt, null, 2) + '\n')
    if (!jsonMode) {
      console.error(`Report written to ${outPath}`)
    }
  }

  if (!jsonMode) {
    console.error('')
    console.error('Golden-Path Conformance — RN-028')
    console.error('\u2500'.repeat(50))
    console.error('')
    console.error(`Target: ${rpt.targetPath}`)
    console.error(`Score:  ${rpt.score}/${rpt.maxScore} (passing: ${rpt.passingScore})`)
    console.error(`Status: ${rpt.status}`)
    console.error('')

    // Category breakdown
    if (rpt.categories) {
      for (const cat of rpt.categories) {
        const bar = renderBar(cat.percentage)
        console.error(`  ${cat.name.padEnd(24)} ${bar} ${cat.score}/${cat.maxScore} (${cat.percentage}%)`)
      }
      console.error('')
    }

    // Failed checks
    const failed = (rpt.findings || []).filter((f) => f.status === 'fail')
    if (failed.length > 0) {
      console.error('\u2500'.repeat(50))
      console.error('Failed Checks:')
      console.error('')
      for (const f of failed) {
        console.error(`  \u2717 [${f.checkId}] ${f.description} (${f.maxPoints} pts)`)
        if (f.remediation) {
          console.error(`    \u2192 ${f.remediation}`)
        }
      }
      console.error('')
    }

    // Passed checks
    const passed = (rpt.findings || []).filter((f) => f.status === 'pass')
    if (passed.length > 0) {
      console.error('Passed Checks:')
      console.error('')
      for (const f of passed) {
        console.error(`  \u2713 [${f.checkId}] ${f.description} (${f.maxPoints} pts)`)
      }
      console.error('')
    }

    console.error('\u2500'.repeat(50))
    console.error(
      `Results: ${rpt.summary?.passed ?? 0} passed, ${rpt.summary?.failed ?? 0} failed — ` +
        `${rpt.score}/${rpt.maxScore} points`
    )
    console.error('')
  }
}

function renderBar(pct) {
  const width = 20
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
}

function buildErrorReport(taxonomyCode, message) {
  return {
    schema: 'ripple-conformance/v1',
    timestamp: new Date().toISOString(),
    targetPath: targetPath === ROOT ? '(self — golden path)' : targetPath,
    score: 0,
    maxScore: 100,
    passingScore: 70,
    status: 'fail',
    categories: [],
    findings: [
      {
        checkId: 'N/A',
        category: 'system',
        description: message,
        status: 'fail',
        points: 0,
        maxPoints: 0,
        taxonomyCode,
        details: message,
        remediation: 'Ensure docs/conformance-rubric.json exists and is valid JSON',
      },
    ],
    summary: { total: 1, passed: 0, failed: 1, score: 0, maxScore: 100 },
  }
}
