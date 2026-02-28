#!/usr/bin/env node
/**
 * Fleet Drift Detection Engine — RN-024
 *
 * Compares a target repository against the golden-path source to detect
 * drift in governed surfaces defined by docs/fleet-policy.json.
 *
 * Usage:
 *   pnpm check:fleet-drift                          # check self (golden-path)
 *   pnpm check:fleet-drift -- --target /path/to/repo # check downstream repo
 *   pnpm check:fleet-drift -- --json                 # JSON report to stdout
 *   pnpm check:fleet-drift -- --ci                   # write fleet-drift-report.json
 *
 * Exit codes:
 *   0 — no security-critical or standards-required drift found
 *   1 — one or more error-severity drifts detected
 *
 * JSON Schema (ripple-fleet-drift/v1):
 *   {
 *     "schema":          "ripple-fleet-drift/v1",
 *     "timestamp":       "ISO-8601",
 *     "sourceVersion":   "golden-path commit SHA",
 *     "targetPath":      "path to target repo",
 *     "complianceScore": 0-100,
 *     "findings":        [...],
 *     "summary":         { total, compliant, drifted, missing, exceptions }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const ROOT = resolve(import.meta.dirname, '..')
const POLICY_PATH = resolve(ROOT, 'docs/fleet-policy.json')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const outputArg = args.find((a) => a.startsWith('--output='))
const targetArg = args.find((a) => a.startsWith('--target='))
const targetPath = targetArg ? resolve(targetArg.split('=')[1]) : ROOT

// ── Load fleet policy ────────────────────────────────────────────────
let policy
try {
  policy = JSON.parse(readFileSync(POLICY_PATH, 'utf-8'))
} catch {
  const errorReport = buildErrorReport('RPL-FLEET-004', 'Fleet policy manifest missing or invalid')
  outputReport(errorReport)
  process.exit(1)
}

// ── Get golden-path version ──────────────────────────────────────────
function getGitSha(dir) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

// ── Checksum utility ─────────────────────────────────────────────────
function fileChecksum(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return createHash('sha256').update(content).digest('hex')
  } catch {
    return null
  }
}

// ── Parse exception comments in target repo ──────────────────────────
const EXCEPTION_RE = /\/\/\s*fleet-policy-exception:\s*(FLEET-SURF-\d+)\s*—\s*(.+)/
function findExceptions(targetDir, paths) {
  const exceptions = []
  for (const p of paths) {
    const fullPath = join(targetDir, p)
    if (!existsSync(fullPath)) continue
    try {
      const content = readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(EXCEPTION_RE)
        if (match) {
          exceptions.push({
            surfaceId: match[1],
            justification: match[2].trim(),
            file: p,
            line: i + 1
          })
        }
      }
    } catch {
      // File unreadable, skip
    }
  }
  return exceptions
}

// ── Compare a single governed surface ────────────────────────────────
function checkSurface(surface) {
  const finding = {
    surfaceId: surface.id,
    name: surface.name,
    status: 'compliant',
    severity: surface.severity,
    taxonomyCode: surface.taxonomyCode,
    strategy: surface.strategy,
    details: [],
    remediation: []
  }

  // Check file paths
  for (const p of surface.paths) {
    const sourcePath = join(ROOT, p)
    const targetFilePath = join(targetPath, p)

    // Source file must exist (golden path)
    if (!existsSync(sourcePath)) {
      // If the source doesn't exist, this surface can't be validated
      finding.details.push(`Source file ${p} not found in golden path (skipped)`)
      continue
    }

    // Target file must exist
    if (!existsSync(targetFilePath)) {
      finding.status = 'missing'
      finding.details.push(`File ${p} missing in target repo`)
      finding.remediation.push(`Copy ${p} from golden-path source`)
      continue
    }

    // Compare checksums if validation enabled
    if (surface.checksumValidation && surface.strategy === 'sync') {
      const sourceSum = fileChecksum(sourcePath)
      const targetSum = fileChecksum(targetFilePath)
      if (sourceSum && targetSum && sourceSum !== targetSum) {
        finding.status = 'drifted'
        finding.details.push(`File ${p} has diverged from golden path (checksum mismatch)`)
        finding.remediation.push(`Update ${p} to match golden-path version`)
      }
    } else if (surface.strategy === 'sync') {
      // Compare content directly for non-checksum surfaces
      try {
        const sourceContent = readFileSync(sourcePath, 'utf-8')
        const targetContent = readFileSync(targetFilePath, 'utf-8')
        if (sourceContent !== targetContent) {
          finding.status = 'drifted'
          finding.details.push(`File ${p} content differs from golden path`)
          finding.remediation.push(`Update ${p} to match golden-path version`)
        }
      } catch {
        finding.details.push(`Could not compare ${p}`)
      }
    }
    // For 'merge' strategy, we check existence but allow differences
    // For 'advisory' strategy, we only report
  }

  // Check field-level comparisons (e.g., package.json fields)
  if (surface.fields) {
    for (const field of surface.fields) {
      const sourceFilePath = join(ROOT, field.file)
      const targetFilePath = join(targetPath, field.file)

      if (!existsSync(sourceFilePath) || !existsSync(targetFilePath)) continue

      try {
        const sourceJson = JSON.parse(readFileSync(sourceFilePath, 'utf-8'))
        const targetJson = JSON.parse(readFileSync(targetFilePath, 'utf-8'))

        const sourceValue = sourceJson[field.key]
        const targetValue = targetJson[field.key]

        if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
          finding.status = 'drifted'
          finding.details.push(
            `Field "${field.key}" in ${field.file} differs: ` +
            `golden-path="${JSON.stringify(sourceValue)}", ` +
            `target="${JSON.stringify(targetValue)}"`
          )
          finding.remediation.push(
            `Update "${field.key}" in ${field.file} to match golden-path value`
          )
        }
      } catch {
        finding.details.push(`Could not parse ${field.file} for field comparison`)
      }
    }
  }

  // If everything checked out and status is still compliant, mark details
  if (finding.status === 'compliant') {
    finding.details.push('All governed files match golden path')
    finding.remediation = []
  }

  return finding
}

// ── Run drift detection ──────────────────────────────────────────────
const sourceVersion = getGitSha(ROOT)
const findings = []
const allExceptions = []

for (const surface of policy.governedSurfaces) {
  // Check for exceptions
  const surfaceExceptions = findExceptions(targetPath, surface.paths)
  const hasException = surfaceExceptions.some((e) => e.surfaceId === surface.id)

  if (hasException) {
    allExceptions.push(...surfaceExceptions.filter((e) => e.surfaceId === surface.id))
    findings.push({
      surfaceId: surface.id,
      name: surface.name,
      status: 'exception',
      severity: surface.severity,
      taxonomyCode: surface.taxonomyCode,
      strategy: surface.strategy,
      details: [`Exception found: ${surfaceExceptions[0].justification}`],
      remediation: ['Review exception and renew if still valid (expires after 90 days)']
    })
    continue
  }

  findings.push(checkSurface(surface))
}

// ── Calculate compliance score ───────────────────────────────────────
const total = findings.length
const compliant = findings.filter((f) => f.status === 'compliant').length
const drifted = findings.filter((f) => f.status === 'drifted').length
const missing = findings.filter((f) => f.status === 'missing').length
const exceptions = findings.filter((f) => f.status === 'exception').length
const complianceScore = total > 0 ? Math.round((compliant / total) * 100) : 100

// ── Build report ─────────────────────────────────────────────────────
const report = {
  schema: 'ripple-fleet-drift/v1',
  timestamp: new Date().toISOString(),
  sourceVersion,
  targetPath: targetPath === ROOT ? '(self — golden path)' : targetPath,
  complianceScore,
  findings,
  exceptions: allExceptions,
  summary: {
    total,
    compliant,
    drifted,
    missing,
    exceptions
  }
}

// ── Determine exit status ────────────────────────────────────────────
const errorFindings = findings.filter(
  (f) =>
    (f.status === 'drifted' || f.status === 'missing') &&
    (f.severity === 'security-critical' || f.severity === 'standards-required')
)
const hasErrors = errorFindings.length > 0

// ── Output ───────────────────────────────────────────────────────────
outputReport(report)
process.exit(hasErrors ? 1 : 0)

// ── Output helpers ───────────────────────────────────────────────────
function outputReport(report) {
  if (jsonMode || ciMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  }

  if (ciMode || outputArg) {
    const outPath = outputArg
      ? resolve(ROOT, outputArg.split('=')[1])
      : resolve(ROOT, 'fleet-drift-report.json')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n')
    if (!jsonMode) {
      console.error(`Report written to ${outPath}`)
    }
  }

  if (!jsonMode) {
    console.error('')
    console.error('Fleet Drift Detection — RN-024')
    console.error('\u2500'.repeat(40))
    console.error('')
    console.error(`Source: golden-path (${report.sourceVersion?.slice(0, 8) ?? 'unknown'})`)
    console.error(`Target: ${report.targetPath}`)
    console.error(`Compliance Score: ${report.complianceScore}%`)
    console.error('')

    for (const f of report.findings) {
      const icons = {
        compliant: '\u2713',
        drifted: '\u2717',
        missing: '\u2717',
        exception: '\u2298'
      }
      const icon = icons[f.status] ?? '?'
      console.error(`  ${icon} [${f.surfaceId}] ${f.name} — ${f.status} (${f.severity})`)
      if (f.status !== 'compliant') {
        for (const detail of f.details) {
          console.error(`      ${detail}`)
        }
      }
    }

    console.error('')
    console.error('\u2500'.repeat(40))
    console.error(
      `Results: ${compliant} compliant, ${drifted} drifted, ` +
      `${missing} missing, ${exceptions} exception(s)`
    )

    if (errorFindings.length > 0) {
      console.error('')
      console.error('Remediation:')
      for (const f of errorFindings) {
        if (f.remediation.length > 0) {
          console.error(`  [${f.surfaceId}] ${f.remediation[0]}`)
        }
      }
    }

    console.error('')
  }
}

function buildErrorReport(taxonomyCode, message) {
  return {
    schema: 'ripple-fleet-drift/v1',
    timestamp: new Date().toISOString(),
    sourceVersion: 'unknown',
    targetPath: targetPath === ROOT ? '(self — golden path)' : targetPath,
    complianceScore: 0,
    findings: [{
      surfaceId: 'N/A',
      name: 'policy-load',
      status: 'drifted',
      severity: 'error',
      taxonomyCode,
      details: [message],
      remediation: ['Ensure docs/fleet-policy.json exists and is valid JSON']
    }],
    exceptions: [],
    summary: { total: 1, compliant: 0, drifted: 1, missing: 0, exceptions: 0 }
  }
}
