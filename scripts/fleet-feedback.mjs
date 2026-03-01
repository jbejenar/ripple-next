#!/usr/bin/env node
/**
 * Fleet Feedback Generator — RN-024
 *
 * Generates structured feedback payloads for downstream repos to send
 * to the golden-path upstream repo. Supports feature requests, bug reports,
 * policy exceptions, improvement shares, and pain points.
 *
 * Usage:
 *   pnpm fleet:feedback -- --type=feature-request --title="Add X" --description="Because Y"
 *   pnpm fleet:feedback -- --type=improvement-share --surface=FLEET-SURF-005 --file=eslint.config.js
 *   pnpm fleet:feedback -- --type=bug-report --surface=FLEET-SURF-001 --title="CI fails"
 *   pnpm fleet:feedback -- --dry-run --json             # preview payload without submitting
 *   pnpm fleet:feedback -- --submit                     # submit via gh issue create
 *
 * Exit codes:
 *   0 — success (submitted or dry-run)
 *   1 — validation error (missing required flag, invalid type)
 *   2 — submission failed (gh CLI error)
 *
 * JSON Schema (ripple-fleet-feedback/v1):
 *   {
 *     "schema":        "ripple-fleet-feedback/v1",
 *     "timestamp":     "ISO-8601",
 *     "sourceRepo":    "from git remote",
 *     "sourceRef":     "from git rev-parse HEAD",
 *     "feedbackType":  "the --type value",
 *     "severity":      "medium",
 *     "governedSurface": "the --surface value or null",
 *     "title":         "the --title value",
 *     "description":   "the --description value or empty",
 *     "evidence":      { driftReport, errorCodes, diff, affectedFiles },
 *     "proposedChange": null,
 *     "metadata":      { agentGenerated, agentType, goldenPathVersion, ... }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')

const VALID_TYPES = [
  'feature-request',
  'bug-report',
  'policy-exception',
  'improvement-share',
  'pain-point',
]

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const dryRun = args.includes('--dry-run')
const submitMode = args.includes('--submit')

function getFlagValue(name) {
  const arg = args.find((a) => a.startsWith(`--${name}=`))
  return arg ? arg.slice(name.length + 3) : null
}

const feedbackType = getFlagValue('type')
const surface = getFlagValue('surface') ?? null
const title = getFlagValue('title')
const description = getFlagValue('description') ?? ''
const filePath = getFlagValue('file') ?? null
const upstreamOverride = getFlagValue('upstream') ?? null
const severity = getFlagValue('severity') ?? 'medium'

// ── Validation ───────────────────────────────────────────────────────
function validationError(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

if (!feedbackType) {
  validationError('--type is required. Valid types: ' + VALID_TYPES.join(', '))
}

if (!VALID_TYPES.includes(feedbackType)) {
  validationError(
    `Invalid type "${feedbackType}". Valid types: ${VALID_TYPES.join(', ')}`
  )
}

if (!title) {
  validationError('--title is required')
}

// ── Auto-detect git info ─────────────────────────────────────────────
function getSourceRepo() {
  try {
    return execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

function getSourceRef() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

const sourceRepo = getSourceRepo()
const sourceRef = getSourceRef()

// ── Load .fleet.json ─────────────────────────────────────────────────
const fleetJsonPath = resolve(ROOT, '.fleet.json')
let fleetConfig = {}
if (existsSync(fleetJsonPath)) {
  try {
    fleetConfig = JSON.parse(readFileSync(fleetJsonPath, 'utf-8'))
  } catch {
    // .fleet.json exists but is not valid JSON — continue with defaults
  }
}

const goldenPathVersion = fleetConfig.goldenPathVersion ?? 'unknown'
const goldenPathRepo =
  upstreamOverride ?? fleetConfig.goldenPathRepo ?? 'unknown'
const fleetPolicyVersion = fleetConfig.fleetPolicyVersion ?? 'unknown'

// ── Build evidence ───────────────────────────────────────────────────
const evidence = {
  driftReport: null,
  errorCodes: [],
  diff: null,
  affectedFiles: [],
}

// For improvement-share with --file: generate a diff
if (feedbackType === 'improvement-share' && filePath) {
  const localFilePath = resolve(ROOT, filePath)
  if (existsSync(localFilePath)) {
    evidence.affectedFiles.push(filePath)
    try {
      const localContent = readFileSync(localFilePath, 'utf-8')

      // Try to get the golden-path version from git using goldenPathVersion
      let goldenContent = null
      if (goldenPathVersion !== 'unknown') {
        try {
          goldenContent = execFileSync(
            'git',
            ['show', `${goldenPathVersion}:${filePath}`],
            { cwd: ROOT, encoding: 'utf-8' }
          )
        } catch {
          // Could not retrieve golden-path version from git
        }
      }

      if (goldenContent !== null) {
        // Generate a unified diff
        evidence.diff = generateUnifiedDiff(
          filePath,
          goldenContent,
          localContent
        )
      } else {
        // No golden-path baseline available — include file content as context
        evidence.diff = `--- a/${filePath} (golden-path: unavailable)\n+++ b/${filePath} (local)\n${localContent}`
      }
    } catch {
      // Could not read local file for diff
    }
  }
}

// For bug-report: include drift report if available
if (feedbackType === 'bug-report') {
  const driftReportPath = resolve(ROOT, 'fleet-drift-report.json')
  if (existsSync(driftReportPath)) {
    try {
      const driftData = JSON.parse(readFileSync(driftReportPath, 'utf-8'))
      evidence.driftReport = driftData

      // Extract affected files from drift findings
      if (driftData.findings) {
        for (const finding of driftData.findings) {
          if (
            finding.status === 'drifted' ||
            finding.status === 'missing'
          ) {
            if (finding.details) {
              for (const detail of finding.details) {
                evidence.affectedFiles.push(detail)
              }
            }
          }
        }
      }
    } catch {
      // Could not parse drift report
    }
  }
}

// ── Build payload ────────────────────────────────────────────────────
const payload = {
  schema: 'ripple-fleet-feedback/v1',
  timestamp: new Date().toISOString(),
  sourceRepo,
  sourceRef,
  feedbackType,
  severity,
  governedSurface: surface,
  title,
  description,
  evidence,
  proposedChange: null,
  metadata: {
    agentGenerated: true,
    agentType: 'claude-code',
    goldenPathVersion,
    complianceScore: null,
    fleetPolicyVersion,
  },
}

// Include compliance score from drift report if available
if (evidence.driftReport && evidence.driftReport.complianceScore != null) {
  payload.metadata.complianceScore = evidence.driftReport.complianceScore
}

// ── Output / Submit ──────────────────────────────────────────────────
if (jsonMode || dryRun) {
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n')
  if (dryRun && !jsonMode) {
    console.error('\n[DRY RUN] Payload preview above. No issue created.\n')
  }
  process.exit(0)
}

if (submitMode) {
  const issueTitle = `[fleet-feedback:${feedbackType}] ${title} (${sourceRepo})`
  const issueBody =
    `## Fleet Feedback\n\n` +
    `**Type:** ${feedbackType} | **Surface:** ${surface ?? 'N/A'} | **Severity:** ${severity}\n` +
    `**Source:** ${sourceRepo} @ ${sourceRef}\n\n` +
    `### Description\n\n` +
    `${description || 'No description provided.'}\n\n` +
    `<!-- fleet-feedback-begin -->\n` +
    `${JSON.stringify(payload, null, 2)}\n` +
    `<!-- fleet-feedback-end -->\n`

  try {
    const issueUrl = execFileSync(
      'gh',
      [
        'issue',
        'create',
        '--repo',
        goldenPathRepo,
        '--title',
        issueTitle,
        '--body',
        issueBody,
      ],
      { cwd: ROOT, encoding: 'utf-8' }
    ).trim()

    console.error(`Issue created: ${issueUrl}`)
    process.exit(0)
  } catch (err) {
    console.error(`Error: failed to create GitHub issue`)
    if (err.stderr) {
      console.error(err.stderr)
    }
    process.exit(2)
  }
}

// Default: human-readable summary to stderr
console.error('')
console.error('Fleet Feedback — RN-024')
console.error('\u2500'.repeat(40))
console.error('')
console.error(`  Type:      ${feedbackType}`)
console.error(`  Title:     ${title}`)
console.error(`  Surface:   ${surface ?? 'N/A'}`)
console.error(`  Severity:  ${severity}`)
console.error(`  Source:    ${sourceRepo}`)
console.error(`  Ref:       ${sourceRef.slice(0, 8)}`)
if (description) {
  console.error(`  Desc:      ${description}`)
}
if (evidence.diff) {
  console.error(`  Diff:      included (${filePath})`)
}
if (evidence.driftReport) {
  console.error(`  Drift:     included (score: ${evidence.driftReport.complianceScore}%)`)
}
console.error('')
console.error('\u2500'.repeat(40))
console.error('Use --json to see full payload, --submit to create issue, --dry-run to preview.')
console.error('')

process.exit(0)

// ── Utility: simple unified diff ─────────────────────────────────────
function generateUnifiedDiff(fileName, oldContent, newContent) {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const result = []
  result.push(`--- a/${fileName}`)
  result.push(`+++ b/${fileName}`)

  // Simple line-by-line diff — not a full Myers algorithm, but sufficient
  // for human-readable feedback payloads
  let i = 0
  let j = 0
  let hunkStart = null
  let hunkLines = []

  function flushHunk() {
    if (hunkLines.length === 0) return
    const oldStart = hunkStart + 1
    const removals = hunkLines.filter((l) => l.startsWith('-')).length
    const additions = hunkLines.filter((l) => l.startsWith('+')).length
    const context = hunkLines.filter((l) => l.startsWith(' ')).length
    const oldCount = removals + context
    const newCount = additions + context
    result.push(`@@ -${oldStart},${oldCount} +${oldStart},${newCount} @@`)
    result.push(...hunkLines)
    hunkLines = []
    hunkStart = null
  }

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Context line — include if near a change
      if (hunkStart !== null) {
        hunkLines.push(` ${oldLines[i]}`)
        // Flush hunk if we have 3+ consecutive context lines after changes
        const recentChanges = hunkLines
          .slice(-3)
          .every((l) => l.startsWith(' '))
        if (recentChanges && hunkLines.length > 6) {
          flushHunk()
        }
      }
      i++
      j++
    } else if (i < oldLines.length && (j >= newLines.length || oldLines[i] !== newLines[j])) {
      if (hunkStart === null) hunkStart = i
      hunkLines.push(`-${oldLines[i]}`)
      i++
    } else {
      if (hunkStart === null) hunkStart = j
      hunkLines.push(`+${newLines[j]}`)
      j++
    }
  }

  flushHunk()

  return result.join('\n')
}
