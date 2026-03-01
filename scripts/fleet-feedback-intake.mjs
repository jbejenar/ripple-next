#!/usr/bin/env node
/**
 * Fleet Feedback Triage Engine — RN-024
 *
 * Processes incoming fleet feedback issues, validates payloads, applies labels,
 * deduplicates against existing issues, and (for improvement-share type)
 * checks patch applicability for draft PR creation.
 *
 * Usage:
 *   pnpm fleet:feedback:intake -- --issue-body="..."         # process from issue body text
 *   pnpm fleet:feedback:intake -- --issue-file=feedback.json  # process from file
 *   pnpm fleet:feedback:intake -- --json                      # JSON output
 *   pnpm fleet:feedback:intake -- --dry-run                   # preview without side effects
 *
 * Exit codes:
 *   0 — triage completed
 *   1 — validation error (invalid payload, missing markers)
 *
 * JSON Schema (ripple-fleet-feedback-triage/v1):
 *   {
 *     "schema":          "ripple-fleet-feedback-triage/v1",
 *     "timestamp":       "ISO-8601",
 *     "issueNumber":     123,
 *     "feedbackType":    "...",
 *     "sourceRepo":      "...",
 *     "labels":          [...],
 *     "priorityScore":   4,
 *     "duplicate":       false,
 *     "duplicateOf":     null,
 *     "patchApplicable": null,
 *     "triage":          { status, action, notes }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const POLICY_PATH = resolve(import.meta.dirname, '../docs/fleet-policy.json')

// ── Valid feedback types ─────────────────────────────────────────────
const VALID_FEEDBACK_TYPES = [
  'feature-request',
  'bug-report',
  'improvement-share',
  'documentation',
  'deprecation-notice'
]

// ── Severity weights ─────────────────────────────────────────────────
const SEVERITY_WEIGHTS = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 1
}

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const dryRun = args.includes('--dry-run')
const issueBodyArg = args.find((a) => a.startsWith('--issue-body='))
const issueFileArg = args.find((a) => a.startsWith('--issue-file='))
const issueNumberArg = args.find((a) => a.startsWith('--issue-number='))

const issueBody = issueBodyArg ? issueBodyArg.slice('--issue-body='.length) : null
const issueFilePath = issueFileArg ? resolve(issueFileArg.slice('--issue-file='.length)) : null
const issueNumber = issueNumberArg ? parseInt(issueNumberArg.slice('--issue-number='.length), 10) : null

// ── Load fleet policy ────────────────────────────────────────────────
let policy
try {
  policy = JSON.parse(readFileSync(POLICY_PATH, 'utf-8'))
} catch {
  const errorReport = buildErrorReport('RPL-FEEDBACK-001', 'Fleet policy manifest missing or invalid')
  outputReport(errorReport)
  process.exit(1)
}

// ── Extract payload ──────────────────────────────────────────────────
let payload
try {
  payload = extractPayload()
} catch (err) {
  const errorReport = buildErrorReport('RPL-FEEDBACK-001', err.message)
  outputReport(errorReport)
  process.exit(1)
}

// ── Validate payload ─────────────────────────────────────────────────
const validationError = validatePayload(payload)
if (validationError) {
  const errorReport = buildErrorReport('RPL-FEEDBACK-001', validationError)
  outputReport(errorReport)
  process.exit(1)
}

// ── Compute labels ───────────────────────────────────────────────────
const labels = computeLabels(payload)

// ── Priority scoring ─────────────────────────────────────────────────
const priorityScore = computePriorityScore(payload)
labels.push(priorityLabel(priorityScore))

// ── Deduplication check ──────────────────────────────────────────────
let duplicate = false
let duplicateOf = null
let deduplicationWarning = null

if (issueNumber && !dryRun) {
  const dedup = checkDuplicate(payload, issueNumber)
  duplicate = dedup.duplicate
  duplicateOf = dedup.duplicateOf
  deduplicationWarning = dedup.warning
  if (duplicate) {
    labels.push('fleet:feedback:duplicate')
  }
}

// ── Patch applicability (improvement-share with diff) ────────────────
let patchApplicable = null
if (payload.feedbackType === 'improvement-share' && payload.evidence && payload.evidence.diff) {
  patchApplicable = checkPatchApplicability(payload.evidence.diff)
}

// ── Determine triage action ──────────────────────────────────────────
const triage = determineTriage(payload, duplicate, patchApplicable)

// ── Build triage report ──────────────────────────────────────────────
const report = {
  schema: 'ripple-fleet-feedback-triage/v1',
  timestamp: new Date().toISOString(),
  issueNumber,
  feedbackType: payload.feedbackType,
  sourceRepo: payload.sourceRepo,
  labels,
  priorityScore,
  duplicate,
  duplicateOf,
  patchApplicable,
  triage
}

// ── Apply labels if not dry-run ──────────────────────────────────────
if (issueNumber && !dryRun) {
  applyLabels(issueNumber, labels)
}

// ── Output ───────────────────────────────────────────────────────────
outputReport(report)
process.exit(0)

// ── Extraction helpers ───────────────────────────────────────────────
function extractPayload() {
  let rawBody = null

  if (issueBody) {
    rawBody = issueBody
  } else if (issueFilePath) {
    if (!existsSync(issueFilePath)) {
      throw new Error(`Issue file not found: ${issueFilePath}`)
    }
    const content = readFileSync(issueFilePath, 'utf-8')

    // If the file ends in .json, try parsing it directly as the payload
    if (issueFilePath.endsWith('.json')) {
      try {
        return JSON.parse(content)
      } catch {
        // Fall through to marker extraction
        rawBody = content
      }
    } else {
      rawBody = content
    }
  } else {
    throw new Error('No input provided. Use --issue-body or --issue-file')
  }

  // Extract JSON from between fleet-feedback markers
  const beginMarker = '<!-- fleet-feedback-begin -->'
  const endMarker = '<!-- fleet-feedback-end -->'

  const beginIdx = rawBody.indexOf(beginMarker)
  const endIdx = rawBody.indexOf(endMarker)

  if (beginIdx === -1 || endIdx === -1 || endIdx <= beginIdx) {
    throw new Error(
      'Missing fleet-feedback markers. Expected <!-- fleet-feedback-begin --> and <!-- fleet-feedback-end --> in issue body'
    )
  }

  const jsonStr = rawBody.slice(beginIdx + beginMarker.length, endIdx).trim()

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error('Invalid JSON between fleet-feedback markers')
  }
}

// ── Validation helpers ───────────────────────────────────────────────
function validatePayload(p) {
  if (!p || typeof p !== 'object') {
    return 'Payload must be a JSON object'
  }

  if (p.schema !== 'ripple-fleet-feedback/v1') {
    return `Invalid schema: expected "ripple-fleet-feedback/v1", got "${p.schema ?? 'undefined'}"`
  }

  const requiredFields = ['feedbackType', 'title', 'sourceRepo']
  for (const field of requiredFields) {
    if (!p[field]) {
      return `Missing required field: ${field}`
    }
  }

  if (!VALID_FEEDBACK_TYPES.includes(p.feedbackType)) {
    return `Invalid feedbackType: "${p.feedbackType}". Must be one of: ${VALID_FEEDBACK_TYPES.join(', ')}`
  }

  return null
}

// ── Label computation ────────────────────────────────────────────────
function computeLabels(p) {
  const result = ['fleet:feedback']

  // Type label
  result.push(`fleet:feedback:${p.feedbackType}`)

  // Surface labels — look up matching surfaces from fleet-policy.json
  if (p.surface && policy.governedSurfaces) {
    const matchedSurface = policy.governedSurfaces.find(
      (s) => s.name === p.surface || s.id === p.surface
    )
    if (matchedSurface) {
      result.push(`surface:${matchedSurface.name}`)
    }
  }

  // Also check for surfaces array
  if (p.surfaces && Array.isArray(p.surfaces) && policy.governedSurfaces) {
    for (const surfRef of p.surfaces) {
      const matchedSurface = policy.governedSurfaces.find(
        (s) => s.name === surfRef || s.id === surfRef
      )
      if (matchedSurface) {
        result.push(`surface:${matchedSurface.name}`)
      }
    }
  }

  return result
}

// ── Priority scoring ─────────────────────────────────────────────────
function computePriorityScore(p) {
  const severity = p.severity || 'medium'
  let score = SEVERITY_WEIGHTS[severity] ?? SEVERITY_WEIGHTS.medium

  // Check if referenced surface is security-critical
  if (policy.governedSurfaces) {
    const surfaceRef = p.surface || (p.surfaces && p.surfaces[0])
    if (surfaceRef) {
      const matchedSurface = policy.governedSurfaces.find(
        (s) => s.name === surfaceRef || s.id === surfaceRef
      )
      if (matchedSurface) {
        if (matchedSurface.severity === 'security-critical') {
          score += 5
        }
        if (matchedSurface.severity === 'standards-required') {
          score += 2
        }
      }
    }
  }

  return score
}

// ── Priority label from score ────────────────────────────────────────
function priorityLabel(score) {
  if (score >= 10) return 'priority:critical'
  if (score >= 7) return 'priority:high'
  if (score >= 4) return 'priority:medium'
  return 'priority:low'
}

// ── Deduplication ────────────────────────────────────────────────────
function checkDuplicate(p, currentIssueNumber) {
  const typeLabel = `fleet:feedback:${p.feedbackType}`
  try {
    const result = execFileSync(
      'gh',
      [
        'issue', 'list',
        '--search', `label:${typeLabel} ${p.sourceRepo} in:body`,
        '--state', 'open',
        '--json', 'number,title',
        '--limit', '10'
      ],
      { encoding: 'utf-8', timeout: 15000 }
    )

    const issues = JSON.parse(result)
    const existing = issues.find((i) => i.number !== currentIssueNumber)

    if (existing) {
      // Add duplicate label and comment
      try {
        execFileSync(
          'gh',
          ['issue', 'edit', String(currentIssueNumber), '--add-label', 'fleet:feedback:duplicate'],
          { encoding: 'utf-8', timeout: 10000 }
        )
      } catch {
        // Label application failed, continue
      }

      try {
        execFileSync(
          'gh',
          [
            'issue', 'comment', String(currentIssueNumber),
            '--body', `Duplicate of #${existing.number} — ${existing.title}`
          ],
          { encoding: 'utf-8', timeout: 10000 }
        )
      } catch {
        // Comment failed, continue
      }

      return {
        duplicate: true,
        duplicateOf: existing.number,
        warning: `RPL-FEEDBACK-002: Duplicate of #${existing.number}`
      }
    }
  } catch {
    // gh CLI unavailable or search failed, skip dedup
  }

  return { duplicate: false, duplicateOf: null, warning: null }
}

// ── Patch applicability check ────────────────────────────────────────
function checkPatchApplicability(diff) {
  // git apply --check is itself a dry-run, so always safe to run
  try {
    execFileSync(
      'git',
      ['apply', '--check', '-'],
      { input: diff, cwd: ROOT, encoding: 'utf-8', timeout: 10000 }
    )
    return true
  } catch {
    return false
  }
}

// ── Triage determination ─────────────────────────────────────────────
function determineTriage(p, isDuplicate, patchResult) {
  if (isDuplicate) {
    return {
      status: 'triaged',
      action: 'duplicate',
      notes: `Duplicate detected — linked to original issue #${duplicateOf}`
    }
  }

  if (p.feedbackType === 'improvement-share' && patchResult === true) {
    return {
      status: 'triaged',
      action: 'auto-pr',
      notes: 'Patch applies cleanly. Ready for draft PR creation.'
    }
  }

  if (p.feedbackType === 'improvement-share' && patchResult === false) {
    return {
      status: 'triaged',
      action: 'review',
      notes: 'Patch has conflicts. Manual review and adaptation needed.'
    }
  }

  return {
    status: 'triaged',
    action: 'review',
    notes: `${p.feedbackType} from ${p.sourceRepo} queued for review`
  }
}

// ── Apply labels via gh CLI ──────────────────────────────────────────
function applyLabels(number, labelList) {
  try {
    execFileSync(
      'gh',
      ['issue', 'edit', String(number), '--add-label', labelList.join(',')],
      { encoding: 'utf-8', timeout: 10000 }
    )
  } catch {
    // gh CLI unavailable or label failed, continue silently
  }
}

// ── Output helpers ───────────────────────────────────────────────────
function outputReport(report) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  }

  if (!jsonMode) {
    console.error('')
    console.error('Fleet Feedback Triage Engine — RN-024')
    console.error('\u2500'.repeat(40))
    console.error('')

    if (report.feedbackType) {
      console.error(`Feedback Type: ${report.feedbackType}`)
      console.error(`Source Repo:   ${report.sourceRepo}`)
      if (report.issueNumber) {
        console.error(`Issue Number:  #${report.issueNumber}`)
      }
      console.error(`Priority:      ${report.priorityScore} (${priorityLabel(report.priorityScore)})`)
      console.error('')

      console.error('Labels:')
      for (const label of report.labels) {
        console.error(`  - ${label}`)
      }
      console.error('')

      if (report.duplicate) {
        console.error(`\u2717 DUPLICATE — linked to #${report.duplicateOf}`)
        console.error('')
      }

      if (report.patchApplicable !== null) {
        const patchIcon = report.patchApplicable ? '\u2713' : '\u2717'
        const patchNote = report.patchApplicable
          ? 'applies cleanly — draft PR can be created'
          : 'has conflicts — manual review needed'
        console.error(`Patch: ${patchIcon} ${patchNote}`)
        console.error('')
      }

      console.error(`Triage: ${report.triage.status} — ${report.triage.action}`)
      console.error(`        ${report.triage.notes}`)
    } else {
      // Error report
      for (const f of report.findings) {
        console.error(`\u2717 [${f.taxonomyCode}] ${f.details[0]}`)
        if (f.remediation) {
          for (const r of f.remediation) {
            console.error(`  ${r}`)
          }
        }
      }
    }

    if (deduplicationWarning) {
      console.error('')
      console.error(`Warning: ${deduplicationWarning}`)
    }

    console.error('')
    console.error('\u2500'.repeat(40))

    if (dryRun) {
      console.error('(dry-run — no side effects applied)')
    }

    console.error('')
  }
}

function buildErrorReport(taxonomyCode, message) {
  return {
    schema: 'ripple-fleet-feedback-triage/v1',
    timestamp: new Date().toISOString(),
    issueNumber,
    feedbackType: null,
    sourceRepo: null,
    labels: [],
    priorityScore: 0,
    duplicate: false,
    duplicateOf: null,
    patchApplicable: null,
    triage: {
      status: 'invalid',
      action: 'invalid',
      notes: message
    },
    findings: [{
      surfaceId: 'N/A',
      name: 'feedback-validation',
      status: 'invalid',
      severity: 'error',
      taxonomyCode,
      details: [message],
      remediation: ['Ensure feedback payload matches ripple-fleet-feedback/v1 schema with required fields']
    }]
  }
}
