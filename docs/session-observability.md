# Agent Session Observability

> Part of RN-043 | See [ADR-018](adr/018-ai-first-workflow-strategy.md) for AI-first strategy

## Overview

Agent session observability tracks metrics from AI agent work sessions to
identify friction points, common failure patterns, and improvement opportunities.
All data is stored locally (`.sessions/` directory, gitignored), opt-in, and
privacy-respecting — no data is sent externally.

## Quick Start

```bash
# Start a session (at beginning of agent work)
pnpm session:start

# Take a mid-session snapshot
pnpm session:snapshot

# End session and capture metrics (optionally run quality gates)
pnpm session:end
pnpm session:end -- --run-gates    # also runs pnpm verify and captures results

# View aggregated metrics across sessions
pnpm agent:metrics
pnpm agent:metrics -- --json       # machine-readable output
pnpm agent:metrics -- --since=7d   # last 7 days only
```

## Session Logger

The session logger (`scripts/session-logger.mjs`) captures three types of events:

| Action | Command | What It Captures |
|--------|---------|------------------|
| **start** | `pnpm session:start` | Timestamp, branch, HEAD commit, operator type |
| **snapshot** | `pnpm session:snapshot` | Current git diff stats, commits since start |
| **end** | `pnpm session:end` | Duration, files changed, commits, gate results, errors |

### Session Schema (`ripple-session-log/v1`)

```json
{
  "schema": "ripple-session-log/v1",
  "sessionId": "uuid",
  "startedAt": "ISO-8601",
  "endedAt": "ISO-8601 | null",
  "duration_ms": 123456,
  "branch": "feature/my-branch",
  "operator": "agent",
  "status": "started | completed | snapshot",
  "startCommit": "abc1234",
  "filesChanged": {
    "created": 5,
    "modified": 12,
    "deleted": 0,
    "paths": ["packages/ui/components/...", "..."]
  },
  "commits": [
    { "hash": "def5678", "message": "feat: add new component" }
  ],
  "gateResults": { "...ripple-gate-summary/v1..." },
  "errors": [
    { "code": "RPL-LINT-001", "count": 1 }
  ]
}
```

### Flags

| Flag | Description |
|------|-------------|
| `--json` | Emit JSON to stdout (for agent consumption) |
| `--run-gates` | Run `pnpm verify --json` and capture results (end only) |
| `--operator=agent\|human` | Tag session operator (default: `agent`) |

## Metrics Aggregation

The aggregation script (`scripts/agent-metrics.mjs`) reads session logs and
produces a metrics report with friction analysis.

### Metrics Schema (`ripple-session-metrics/v1`)

```json
{
  "schema": "ripple-session-metrics/v1",
  "timestamp": "ISO-8601",
  "period": { "from": "ISO-8601", "to": "ISO-8601" },
  "sessions": {
    "total": 10,
    "completed": 8,
    "avgDuration_ms": 180000
  },
  "files": {
    "totalChanged": 45,
    "created": 12,
    "modified": 30,
    "deleted": 3,
    "hotPaths": [
      { "path": "packages/ui/...", "count": 5 }
    ]
  },
  "gates": {
    "totalRuns": 56,
    "passRate": 0.929,
    "byGate": {
      "lint": { "pass": 7, "fail": 1 },
      "test": { "pass": 8, "fail": 0 }
    }
  },
  "errors": {
    "total": 3,
    "byCode": [
      { "code": "RPL-LINT-001", "count": 2 }
    ]
  },
  "friction": {
    "topFailures": [
      { "gate": "lint", "failures": 1, "total": 8 }
    ],
    "avgTimeToGreen_ms": 120000,
    "recommendations": [
      "Most common gate failure: \"lint\" (1/8 runs). Investigate root cause."
    ]
  }
}
```

### Flags

| Flag | Description |
|------|-------------|
| `--json` | Emit JSON to stdout |
| `--ci` | Write `session-metrics.json` for CI artifact upload |
| `--output=path` | Write JSON to a specific file |
| `--since=7d` | Filter sessions to last N days/hours/minutes (e.g., `7d`, `24h`, `30m`) |
| `--top=5` | Number of top items in hot paths and friction lists (default: 5) |

## Integration with Agent Workflow

### Recommended Agent Session Pattern

```bash
# 1. Start session at beginning of work
pnpm session:start

# 2. Do work (implement features, fix bugs, etc.)
# ... code changes, tests, etc.

# 3. Optionally snapshot mid-session
pnpm session:snapshot

# 4. End session with gate capture
pnpm session:end -- --run-gates

# 5. Review aggregated metrics periodically
pnpm agent:metrics
```

### CI Integration

Add session metrics as a CI artifact for long-running agent sessions:

```yaml
- name: Agent metrics report
  run: pnpm agent:metrics -- --ci
- uses: actions/upload-artifact@v4
  with:
    name: session-metrics
    path: session-metrics.json
    retention-days: 30
```

## Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `RPL-SESSION-001` | error | Session logger initialization failed |
| `RPL-SESSION-002` | warning | Session log file corrupted or unreadable |
| `RPL-SESSION-003` | info | No session data available for aggregation |

See `docs/error-taxonomy.json` for full remediation paths.

## Privacy

- All session data is stored locally in `.sessions/` (gitignored)
- No data is sent to external services
- Session IDs are random UUIDs with no PII
- Operator field is a type tag (`agent`/`human`), not an identity
- File paths reference repository-relative paths only

## Storage

Session files are stored as JSON in `.sessions/`:

```
.sessions/
  2026-02-28T10-30-00-000Z_abc12345.json   # session log
  2026-02-28T10-30-00-000Z_abc12345_snap_1709123456789.json  # snapshot
```

Files accumulate over time. To clean up old sessions:

```bash
# Remove sessions older than 30 days
find .sessions -name '*.json' -mtime +30 -delete
```
