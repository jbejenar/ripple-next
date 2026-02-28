#!/usr/bin/env node
/**
 * Agent Session Logger — Lightweight Session Event Capture
 *
 * Captures agent session data for observability and friction analysis.
 * Part of RN-043: Agent Session Observability.
 *
 * Usage:
 *   pnpm session:start                  # record session start
 *   pnpm session:end                    # record session end + capture metrics
 *   pnpm session:end -- --json          # JSON output to stdout
 *   pnpm session:snapshot               # mid-session checkpoint
 *   pnpm session:end -- --run-gates     # run quality gates and capture results
 *
 * Sessions are stored in .sessions/ (gitignored, opt-in, privacy-respecting).
 * No data is sent externally — all storage is local.
 *
 * JSON Schema (ripple-session-log/v1):
 *   {
 *     "schema":       "ripple-session-log/v1",
 *     "sessionId":    "<uuid>",
 *     "startedAt":    "ISO-8601",
 *     "endedAt":      "ISO-8601 | null",
 *     "duration_ms":  <int | null>,
 *     "branch":       "<git branch>",
 *     "operator":     "agent | human",
 *     "status":       "started | completed | snapshot",
 *     "filesChanged": { "created": <int>, "modified": <int>, "deleted": <int>, "paths": [...] },
 *     "commits":      [{ "hash": "...", "message": "..." }],
 *     "gateResults":  <ripple-gate-summary/v1 | null>,
 *     "errors":       [{ "code": "RPL-*-NNN", "count": <int> }]
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const ROOT = resolve(import.meta.dirname, '..')
const SESSIONS_DIR = resolve(ROOT, '.sessions')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const action = args[0] // 'start', 'end', 'snapshot'
const jsonMode = args.includes('--json')
const runGates = args.includes('--run-gates')
const operatorArg = args.find((a) => a.startsWith('--operator='))
const operator = operatorArg ? operatorArg.split('=')[1] : 'agent'

if (!action || !['start', 'end', 'snapshot'].includes(action)) {
  process.stderr.write(`Usage: session-logger.mjs <start|end|snapshot> [--json] [--run-gates] [--operator=agent|human]\n`)
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────
function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf-8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  } catch {
    return ''
  }
}

function getBranch() {
  return git('branch', '--show-current') || 'detached'
}

function getGitDiffStats(since) {
  const created = []
  const modified = []
  const deleted = []

  // Uncommitted changes
  const status = git('status', '--porcelain')
  for (const line of status.split('\n').filter(Boolean)) {
    const code = line.substring(0, 2).trim()
    const file = line.substring(3)
    if (code === '??' || code === 'A') created.push(file)
    else if (code === 'M' || code === 'MM') modified.push(file)
    else if (code === 'D') deleted.push(file)
  }

  // Committed changes since session start (if we have a since commit)
  if (since) {
    const diffNameStatus = git('diff', '--name-status', `${since}..HEAD`)
    for (const line of diffNameStatus.split('\n').filter(Boolean)) {
      const [status, file] = line.split('\t')
      if (!file) continue
      if (status === 'A' && !created.includes(file)) created.push(file)
      else if (status === 'M' && !modified.includes(file)) modified.push(file)
      else if (status === 'D' && !deleted.includes(file)) deleted.push(file)
    }
  }

  return {
    created: created.length,
    modified: modified.length,
    deleted: deleted.length,
    paths: [...new Set([...created, ...modified, ...deleted])].sort(),
  }
}

function getCommitsSince(since) {
  if (!since) return []
  const log = git('log', '--oneline', `${since}..HEAD`)
  return log
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const spaceIdx = line.indexOf(' ')
      return {
        hash: line.substring(0, spaceIdx),
        message: line.substring(spaceIdx + 1),
      }
    })
}

function runQualityGates() {
  try {
    const output = execFileSync('node', ['scripts/verify.mjs', '--json'], {
      encoding: 'utf-8',
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300_000,
    })
    return JSON.parse(output)
  } catch (err) {
    // verify.mjs exits non-zero on gate failure but still writes JSON to stdout
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {
        return null
      }
    }
    return null
  }
}

function extractErrorCodes(gateResults) {
  if (!gateResults || !gateResults.gates) return []
  const codes = []
  for (const gate of gateResults.gates) {
    if (gate.status === 'fail') {
      // Map gates to taxonomy codes
      const codeMap = {
        'validate:env': 'RPL-ENV-003',
        lint: 'RPL-LINT-001',
        typecheck: 'RPL-TYPE-001',
        test: 'RPL-TEST-001',
        'check:readiness': 'RPL-POLICY-001',
        'check:quarantine': 'RPL-POLICY-002',
        'check:iac': 'RPL-IAC-001',
        'check:fleet-drift': 'RPL-FLEET-001',
      }
      const code = codeMap[gate.gate]
      if (code) codes.push({ code, count: 1 })
    }
  }
  return codes
}

function findActiveSession() {
  if (!existsSync(SESSIONS_DIR)) return null
  const files = readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()

  for (const file of files) {
    try {
      const session = JSON.parse(readFileSync(resolve(SESSIONS_DIR, file), 'utf-8'))
      if (session.status === 'started') return { session, file }
    } catch {
      // Skip corrupt files
    }
  }
  return null
}

// ── Ensure .sessions directory exists ────────────────────────────────
mkdirSync(SESSIONS_DIR, { recursive: true })

// ── Actions ──────────────────────────────────────────────────────────

if (action === 'start') {
  const sessionId = randomUUID()
  const headCommit = git('rev-parse', '--short', 'HEAD') || null
  const session = {
    schema: 'ripple-session-log/v1',
    sessionId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    duration_ms: null,
    branch: getBranch(),
    operator,
    status: 'started',
    startCommit: headCommit,
    filesChanged: { created: 0, modified: 0, deleted: 0, paths: [] },
    commits: [],
    gateResults: null,
    errors: [],
  }

  const filename = `${session.startedAt.replace(/[:.]/g, '-')}_${sessionId.slice(0, 8)}.json`
  writeFileSync(resolve(SESSIONS_DIR, filename), JSON.stringify(session, null, 2) + '\n')

  if (jsonMode) {
    process.stdout.write(JSON.stringify(session, null, 2) + '\n')
  } else {
    process.stderr.write(`Session started: ${sessionId.slice(0, 8)}\n`)
    process.stderr.write(`  Branch: ${session.branch}\n`)
    process.stderr.write(`  Operator: ${operator}\n`)
    process.stderr.write(`  File: .sessions/${filename}\n`)
  }
}

if (action === 'end') {
  const active = findActiveSession()
  if (!active) {
    process.stderr.write('No active session found. Start one with: pnpm session:start\n')
    process.exit(1)
  }

  const { session, file } = active
  const now = new Date()
  session.endedAt = now.toISOString()
  session.duration_ms = now.getTime() - new Date(session.startedAt).getTime()
  session.status = 'completed'
  session.branch = getBranch()
  session.filesChanged = getGitDiffStats(session.startCommit)
  session.commits = getCommitsSince(session.startCommit)

  if (runGates) {
    if (!jsonMode) process.stderr.write('Running quality gates...\n')
    session.gateResults = runQualityGates()
    session.errors = extractErrorCodes(session.gateResults)
  }

  writeFileSync(resolve(SESSIONS_DIR, file), JSON.stringify(session, null, 2) + '\n')

  if (jsonMode) {
    process.stdout.write(JSON.stringify(session, null, 2) + '\n')
  } else {
    const durationSecs = (session.duration_ms / 1000).toFixed(0)
    const totalFiles = session.filesChanged.created + session.filesChanged.modified + session.filesChanged.deleted
    process.stderr.write(`\nSession completed: ${session.sessionId.slice(0, 8)}\n`)
    process.stderr.write(`  Duration: ${durationSecs}s\n`)
    process.stderr.write(`  Files changed: ${totalFiles} (${session.filesChanged.created} created, ${session.filesChanged.modified} modified, ${session.filesChanged.deleted} deleted)\n`)
    process.stderr.write(`  Commits: ${session.commits.length}\n`)
    if (session.gateResults) {
      const icon = session.gateResults.status === 'pass' ? '\u2713' : '\u2717'
      process.stderr.write(`  Gates: ${icon} ${session.gateResults.passed}/${session.gateResults.total} passed\n`)
    }
    if (session.errors.length > 0) {
      process.stderr.write(`  Errors: ${session.errors.map((e) => e.code).join(', ')}\n`)
    }
  }
}

if (action === 'snapshot') {
  const active = findActiveSession()
  if (!active) {
    process.stderr.write('No active session found. Start one with: pnpm session:start\n')
    process.exit(1)
  }

  const { session, file } = active
  const snapshot = {
    ...session,
    status: 'snapshot',
    snapshotAt: new Date().toISOString(),
    branch: getBranch(),
    filesChanged: getGitDiffStats(session.startCommit),
    commits: getCommitsSince(session.startCommit),
  }

  // Write snapshot as separate file, keep original session open
  const snapshotFile = file.replace('.json', `_snap_${Date.now()}.json`)
  writeFileSync(resolve(SESSIONS_DIR, snapshotFile), JSON.stringify(snapshot, null, 2) + '\n')

  if (jsonMode) {
    process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n')
  } else {
    const totalFiles = snapshot.filesChanged.created + snapshot.filesChanged.modified + snapshot.filesChanged.deleted
    process.stderr.write(`Snapshot captured for session ${session.sessionId.slice(0, 8)}\n`)
    process.stderr.write(`  Files changed: ${totalFiles}\n`)
    process.stderr.write(`  Commits: ${snapshot.commits.length}\n`)
  }
}
