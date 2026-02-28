#!/usr/bin/env node
/**
 * Agent Session Metrics Aggregator — Friction Analysis & Insights
 *
 * Aggregates metrics from agent session logs to identify friction points,
 * common failure patterns, and improvement opportunities.
 * Part of RN-043: Agent Session Observability.
 *
 * Usage:
 *   pnpm agent:metrics                     # human-readable summary
 *   pnpm agent:metrics -- --json           # JSON output to stdout
 *   pnpm agent:metrics -- --ci             # write session-metrics.json artifact
 *   pnpm agent:metrics -- --output=path    # write JSON to specific file
 *   pnpm agent:metrics -- --since=7d       # filter to last 7 days (default: all)
 *   pnpm agent:metrics -- --top=5          # top N friction items (default: 5)
 *
 * JSON Schema (ripple-session-metrics/v1):
 *   {
 *     "schema":     "ripple-session-metrics/v1",
 *     "timestamp":  "ISO-8601",
 *     "period":     { "from": "ISO-8601", "to": "ISO-8601" },
 *     "sessions":   { "total": <int>, "completed": <int>, "avgDuration_ms": <int> },
 *     "files":      { "totalChanged": <int>, "created": <int>, "modified": <int>, "deleted": <int>,
 *                     "hotPaths": [{ "path": "...", "count": <int> }] },
 *     "gates":      { "totalRuns": <int>, "passRate": <float>, "byGate": { "<name>": { "pass": <int>, "fail": <int> } } },
 *     "errors":     { "total": <int>, "byCode": [{ "code": "RPL-*-NNN", "count": <int> }] },
 *     "friction":   { "topFailures": [...], "avgTimeToGreen_ms": <int|null>, "recommendations": [...] }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SESSIONS_DIR = resolve(ROOT, '.sessions')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const outputArg = args.find((a) => a.startsWith('--output='))
const outputFile = outputArg ? outputArg.split('=')[1] : null
const sinceArg = args.find((a) => a.startsWith('--since='))
const topArg = args.find((a) => a.startsWith('--top='))
const topN = topArg ? parseInt(topArg.split('=')[1], 10) : 5

function parseSince(sinceStr) {
  if (!sinceStr) return null
  const match = sinceStr.match(/^(\d+)([dhm])$/)
  if (!match) return null
  const [, num, unit] = match
  const ms = { d: 86400000, h: 3600000, m: 60000 }
  return Date.now() - parseInt(num, 10) * (ms[unit] || 86400000)
}

const sinceMs = sinceArg ? parseSince(sinceArg.split('=')[1]) : null

// ── Load sessions ────────────────────────────────────────────────────
function loadSessions() {
  if (!existsSync(SESSIONS_DIR)) return []

  const files = readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json') && !f.includes('_snap_'))
  const sessions = []

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(resolve(SESSIONS_DIR, file), 'utf-8'))
      if (data.schema !== 'ripple-session-log/v1') continue
      if (data.status === 'snapshot') continue

      // Filter by since
      if (sinceMs) {
        const sessionTime = new Date(data.startedAt).getTime()
        if (sessionTime < sinceMs) continue
      }

      sessions.push(data)
    } catch {
      // Skip corrupt files
    }
  }

  return sessions.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
}

// ── Aggregate metrics ────────────────────────────────────────────────
function aggregate(sessions) {
  const completed = sessions.filter((s) => s.status === 'completed')
  const withGates = completed.filter((s) => s.gateResults)

  // File metrics
  let totalCreated = 0
  let totalModified = 0
  let totalDeleted = 0
  const pathCounts = new Map()

  for (const s of completed) {
    if (!s.filesChanged) continue
    totalCreated += s.filesChanged.created || 0
    totalModified += s.filesChanged.modified || 0
    totalDeleted += s.filesChanged.deleted || 0
    for (const p of s.filesChanged.paths || []) {
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1)
    }
  }

  const hotPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([path, count]) => ({ path, count }))

  // Gate metrics
  const gateStats = new Map()
  let totalGateRuns = 0
  let totalGatePasses = 0

  for (const s of withGates) {
    if (!s.gateResults?.gates) continue
    for (const gate of s.gateResults.gates) {
      totalGateRuns++
      if (gate.status === 'pass') totalGatePasses++

      if (!gateStats.has(gate.gate)) {
        gateStats.set(gate.gate, { pass: 0, fail: 0 })
      }
      const stat = gateStats.get(gate.gate)
      if (gate.status === 'pass') stat.pass++
      else stat.fail++
    }
  }

  const byGate = Object.fromEntries(gateStats)
  const passRate = totalGateRuns > 0 ? totalGatePasses / totalGateRuns : null

  // Error metrics
  const errorCounts = new Map()
  for (const s of completed) {
    for (const err of s.errors || []) {
      errorCounts.set(err.code, (errorCounts.get(err.code) || 0) + (err.count || 1))
    }
  }

  const byCode = [...errorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, count }))

  // Duration metrics
  const durations = completed.filter((s) => s.duration_ms != null).map((s) => s.duration_ms)
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

  // Time-to-green: sessions that ended with all gates passing
  const greenSessions = withGates.filter((s) => s.gateResults?.status === 'pass' && s.duration_ms != null)
  const avgTimeToGreen =
    greenSessions.length > 0
      ? Math.round(greenSessions.reduce((a, s) => a + s.duration_ms, 0) / greenSessions.length)
      : null

  // Friction: top failure patterns
  const failingGates = [...gateStats.entries()]
    .filter(([, stat]) => stat.fail > 0)
    .sort((a, b) => b[1].fail - a[1].fail)
    .slice(0, topN)
    .map(([gate, stat]) => ({ gate, failures: stat.fail, total: stat.pass + stat.fail }))

  // Recommendations
  const recommendations = []
  if (failingGates.length > 0) {
    const worst = failingGates[0]
    recommendations.push(
      `Most common gate failure: "${worst.gate}" (${worst.failures}/${worst.total} runs). Investigate root cause.`
    )
  }
  if (byCode.length > 0) {
    recommendations.push(
      `Most frequent error code: ${byCode[0].code} (${byCode[0].count} occurrences). Check error-taxonomy.json for remediation.`
    )
  }
  if (avgDuration && avgDuration > 600_000) {
    recommendations.push(`Average session duration is ${Math.round(avgDuration / 60000)}min. Consider breaking large tasks into smaller sessions.`)
  }
  if (sessions.length > 0 && completed.length < sessions.length * 0.8) {
    recommendations.push(`${sessions.length - completed.length} of ${sessions.length} sessions were not completed. Check for blocked sessions.`)
  }
  if (recommendations.length === 0) {
    recommendations.push('No friction signals detected. Agent workflow appears healthy.')
  }

  // Period
  const timestamps = sessions.map((s) => new Date(s.startedAt).getTime())
  const from = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null
  const to = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null

  return {
    schema: 'ripple-session-metrics/v1',
    timestamp: new Date().toISOString(),
    period: { from, to },
    sessions: {
      total: sessions.length,
      completed: completed.length,
      avgDuration_ms: avgDuration,
    },
    files: {
      totalChanged: totalCreated + totalModified + totalDeleted,
      created: totalCreated,
      modified: totalModified,
      deleted: totalDeleted,
      hotPaths,
    },
    gates: {
      totalRuns: totalGateRuns,
      passRate: passRate != null ? Math.round(passRate * 1000) / 1000 : null,
      byGate,
    },
    errors: {
      total: byCode.reduce((a, e) => a + e.count, 0),
      byCode,
    },
    friction: {
      topFailures: failingGates,
      avgTimeToGreen_ms: avgTimeToGreen,
      recommendations,
    },
  }
}

// ── Main ─────────────────────────────────────────────────────────────
const sessions = loadSessions()

if (sessions.length === 0 && !jsonMode) {
  process.stderr.write('No session data found.\n')
  process.stderr.write('Start tracking with: pnpm session:start\n')
  process.stderr.write('End a session with: pnpm session:end\n')
  process.exit(0)
}

const report = aggregate(sessions)

// ── Output ───────────────────────────────────────────────────────────
if (jsonMode) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else if (sessions.length > 0) {
  process.stderr.write('\nAgent Session Metrics\n')
  process.stderr.write('\u2500'.repeat(40) + '\n')

  // Sessions
  process.stderr.write(`\nSessions: ${report.sessions.total} total, ${report.sessions.completed} completed\n`)
  if (report.sessions.avgDuration_ms != null) {
    const mins = Math.round(report.sessions.avgDuration_ms / 60000)
    process.stderr.write(`Average duration: ${mins}min\n`)
  }

  // Files
  if (report.files.totalChanged > 0) {
    process.stderr.write(`\nFiles: ${report.files.totalChanged} changed (${report.files.created} created, ${report.files.modified} modified, ${report.files.deleted} deleted)\n`)
    if (report.files.hotPaths.length > 0) {
      process.stderr.write('Hot paths:\n')
      for (const hp of report.files.hotPaths) {
        process.stderr.write(`  ${hp.count}x ${hp.path}\n`)
      }
    }
  }

  // Gates
  if (report.gates.totalRuns > 0) {
    const pct = report.gates.passRate != null ? (report.gates.passRate * 100).toFixed(1) : '—'
    process.stderr.write(`\nGates: ${report.gates.totalRuns} runs, ${pct}% pass rate\n`)
    for (const [gate, stat] of Object.entries(report.gates.byGate)) {
      const icon = stat.fail === 0 ? '\u2713' : '\u2717'
      process.stderr.write(`  ${icon} ${gate}: ${stat.pass} pass, ${stat.fail} fail\n`)
    }
  }

  // Errors
  if (report.errors.total > 0) {
    process.stderr.write(`\nErrors: ${report.errors.total} total\n`)
    for (const err of report.errors.byCode) {
      process.stderr.write(`  ${err.code}: ${err.count}\n`)
    }
  }

  // Friction
  if (report.friction.avgTimeToGreen_ms != null) {
    const mins = Math.round(report.friction.avgTimeToGreen_ms / 60000)
    process.stderr.write(`\nAvg time-to-green: ${mins}min\n`)
  }

  if (report.friction.recommendations.length > 0) {
    process.stderr.write('\nRecommendations:\n')
    for (const rec of report.friction.recommendations) {
      process.stderr.write(`  \u2022 ${rec}\n`)
    }
  }

  process.stderr.write('\n')
} else {
  // JSON mode with no sessions still outputs valid report
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
}

// ── Write JSON to file if requested ──────────────────────────────────
const writePath = outputFile || (ciMode ? resolve(ROOT, 'session-metrics.json') : null)

if (writePath) {
  const absPath = resolve(ROOT, writePath)
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, JSON.stringify(report, null, 2) + '\n')
  if (!jsonMode) {
    process.stderr.write(`Metrics written to: ${absPath}\n`)
  }
}
