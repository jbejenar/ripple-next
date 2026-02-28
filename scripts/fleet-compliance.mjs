#!/usr/bin/env node
/**
 * Fleet Compliance Report Generator — RN-024
 *
 * Aggregates fleet drift reports from multiple downstream repos into a
 * unified compliance report. Outputs as JSON and/or GitHub Actions step
 * summary (markdown table).
 *
 * Usage:
 *   pnpm fleet:compliance -- --reports=./reports/     # dir of drift JSONs
 *   pnpm fleet:compliance -- --repos=org/a,org/b      # scan live repos
 *   pnpm fleet:compliance -- --json                   # JSON output
 *   pnpm fleet:compliance -- --ci                     # write + step summary
 *
 * Exit codes:
 *   0 — all repos meet compliance targets
 *   1 — one or more repos below compliance targets
 *
 * JSON Schema (ripple-fleet-compliance/v1):
 *   {
 *     "schema":           "ripple-fleet-compliance/v1",
 *     "timestamp":        "ISO-8601",
 *     "goldenPathVersion": "SHA",
 *     "fleet":            [...],
 *     "summary":          { totalRepos, avgComplianceScore, ... }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const POLICY_PATH = resolve(ROOT, 'docs/fleet-policy.json')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const outputArg = args.find((a) => a.startsWith('--output='))
const reportsArg = args.find((a) => a.startsWith('--reports='))

// ── Load fleet policy ────────────────────────────────────────────────
let policy
try {
  policy = JSON.parse(readFileSync(POLICY_PATH, 'utf-8'))
} catch {
  console.error('Error: docs/fleet-policy.json not found or invalid')
  process.exit(1)
}

// ── Get golden-path version ──────────────────────────────────────────
function getGitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

// ── Load drift reports from directory ────────────────────────────────
function loadReportsFromDir(dirPath) {
  const reports = []
  const absDir = resolve(dirPath)
  if (!existsSync(absDir)) {
    console.error(`Reports directory not found: ${absDir}`)
    return reports
  }

  for (const file of readdirSync(absDir)) {
    if (!file.endsWith('.json')) continue
    try {
      const content = JSON.parse(readFileSync(join(absDir, file), 'utf-8'))
      if (content.schema === 'ripple-fleet-drift/v1') {
        reports.push(content)
      }
    } catch {
      // Skip invalid files
    }
  }
  return reports
}

// ── Self-check mode (no args = check self) ───────────────────────────
let driftReports = []

if (reportsArg) {
  driftReports = loadReportsFromDir(reportsArg.split('=')[1])
} else {
  // Default: run drift detection against self (golden path)
  try {
    const output = execFileSync('node', [
      resolve(ROOT, 'scripts/check-fleet-drift.mjs'),
      '--json',
    ], { encoding: 'utf-8', cwd: ROOT })
    driftReports.push(JSON.parse(output))
  } catch (err) {
    try {
      if (err.stdout) driftReports.push(JSON.parse(err.stdout))
    } catch {
      console.error('Error: could not generate self-check drift report')
    }
  }
}

// ── Build compliance report ──────────────────────────────────────────
const fleet = driftReports.map((report) => {
  const securityDrifts = report.findings.filter(
    (f) => (f.status === 'drifted' || f.status === 'missing') && f.severity === 'security-critical'
  ).length
  const standardsDrifts = report.findings.filter(
    (f) => (f.status === 'drifted' || f.status === 'missing') && f.severity === 'standards-required'
  ).length

  return {
    repo: report.targetPath,
    complianceScore: report.complianceScore,
    criticalDrifts: securityDrifts,
    standardsDrifts,
    totalSurfaces: report.summary.total,
    compliant: report.summary.compliant,
    lastScanDate: report.timestamp,
    meetsTarget: report.complianceScore >= (policy.complianceTargets?.minimumScore ?? 80)
  }
})

const totalRepos = fleet.length
const avgComplianceScore = totalRepos > 0
  ? Math.round(fleet.reduce((sum, r) => sum + r.complianceScore, 0) / totalRepos)
  : 0
const criticalDriftCount = fleet.reduce((sum, r) => sum + r.criticalDrifts, 0)
const reposBelow = fleet.filter((r) => !r.meetsTarget).length

const complianceReport = {
  schema: 'ripple-fleet-compliance/v1',
  timestamp: new Date().toISOString(),
  goldenPathVersion: getGitSha(),
  complianceTargets: policy.complianceTargets,
  fleet,
  summary: {
    totalRepos,
    avgComplianceScore,
    criticalDriftCount,
    reposBelowTarget: reposBelow,
    reposMeetingTarget: totalRepos - reposBelow
  }
}

// ── Output ───────────────────────────────────────────────────────────
if (jsonMode || ciMode) {
  process.stdout.write(JSON.stringify(complianceReport, null, 2) + '\n')
}

if (ciMode || outputArg) {
  const outPath = outputArg
    ? resolve(ROOT, outputArg.split('=')[1])
    : resolve(ROOT, 'fleet-compliance-report.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(complianceReport, null, 2) + '\n')
  if (!jsonMode) {
    console.error(`Report written to ${outPath}`)
  }
}

// ── Write GitHub Actions step summary if in CI ───────────────────────
if (process.env.GITHUB_STEP_SUMMARY) {
  let summary = '## Fleet Compliance Report\n\n'
  summary += `| Metric | Value |\n|--------|-------|\n`
  summary += `| Total Repos | ${totalRepos} |\n`
  summary += `| Avg Compliance | ${avgComplianceScore}% |\n`
  summary += `| Critical Drifts | ${criticalDriftCount} |\n`
  summary += `| Below Target | ${reposBelow} |\n\n`

  if (fleet.length > 0) {
    summary += '### Per-Repo Status\n\n'
    summary += '| Repo | Score | Critical | Standards | Status |\n'
    summary += '|------|-------|----------|-----------|--------|\n'
    for (const r of fleet) {
      const status = r.meetsTarget ? 'Pass' : 'Fail'
      summary += `| ${r.repo} | ${r.complianceScore}% | ${r.criticalDrifts} | ${r.standardsDrifts} | ${status} |\n`
    }
  }

  try {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY
    writeFileSync(summaryPath, summary, { flag: 'a' })
  } catch {
    // Not in GitHub Actions, skip
  }
}

if (!jsonMode) {
  console.error('')
  console.error('Fleet Compliance Report — RN-024')
  console.error('\u2500'.repeat(40))
  console.error('')
  console.error(`Golden path: ${complianceReport.goldenPathVersion?.slice(0, 8) ?? 'unknown'}`)
  console.error(`Repos scanned: ${totalRepos}`)
  console.error(`Average compliance: ${avgComplianceScore}%`)
  console.error(`Critical drifts: ${criticalDriftCount}`)
  console.error(`Repos below target: ${reposBelow}`)
  console.error('')

  for (const r of fleet) {
    const icon = r.meetsTarget ? '\u2713' : '\u2717'
    console.error(`  ${icon} ${r.repo} — ${r.complianceScore}% (critical: ${r.criticalDrifts}, standards: ${r.standardsDrifts})`)
  }

  console.error('')
  console.error('\u2500'.repeat(40))
  console.error(`Target: ${policy.complianceTargets?.minimumScore ?? 80}% minimum compliance`)
  console.error('')
}

// Exit with error if any repo has critical drifts or is below target
process.exit(criticalDriftCount > 0 || reposBelow > 0 ? 1 : 0)
