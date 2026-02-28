/**
 * Scaffold: Quality gate scripts.
 *
 * Mix of literal copies from ripple-next source and templated starters.
 * Literal copies ensure downstream repos get the exact same quality tooling.
 */
import { join } from 'node:path'
import { copyFileFromSource, writeFileExternal } from '../lib.mjs'

export function scaffoldScripts(targetDir, config, options = {}) {
  const { name } = config
  const opts = { dryRun: options.dryRun, force: options.force }

  console.log('\n  Quality Gate Scripts')
  console.log('  ' + '─'.repeat(30))

  // ── Literal copies from ripple-next ───────────────────────────────
  copyFileFromSource('scripts/check-readiness.mjs', 'scripts/check-readiness.mjs', targetDir, opts)
  copyFileFromSource(
    'scripts/check-quarantine.mjs',
    'scripts/check-quarantine.mjs',
    targetDir,
    opts
  )
  copyFileFromSource('scripts/runbook.mjs', 'scripts/runbook.mjs', targetDir, opts)

  // ── scripts/verify.mjs (templated — simplified for downstream) ────
  writeFileExternal(
    join(targetDir, 'scripts', 'verify.mjs'),
    `#!/usr/bin/env node
/**
 * Unified Quality Gate Runner for ${name}.
 *
 * Runs all quality gates and prints a structured summary.
 * Scaffolded from ripple-next golden path.
 *
 * Usage:
 *   pnpm verify              # run all gates
 *   pnpm verify -- --json    # JSON output
 */
import { execSync } from 'node:child_process'

const jsonMode = process.argv.includes('--json')
const results = []

const gates = [
  { name: 'lint', command: 'pnpm lint' },
  { name: 'typecheck', command: 'pnpm typecheck' },
  { name: 'test', command: 'pnpm test' },
  { name: 'readiness', command: 'node scripts/check-readiness.mjs' },
]

for (const gate of gates) {
  const start = Date.now()
  let passed = false
  let output = ''
  try {
    output = execSync(gate.command, { encoding: 'utf-8', stdio: 'pipe' })
    passed = true
  } catch (err) {
    output = err.stdout || err.message
  }
  const duration = Date.now() - start
  results.push({ name: gate.name, passed, duration, output })
  if (!jsonMode) {
    const icon = passed ? '\\u2705' : '\\u274C'
    console.log(\`  \${icon} \${gate.name} (\${duration}ms)\`)
  }
}

const allPassed = results.every((r) => r.passed)

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        schema: 'ripple-gate-summary/v1',
        project: '${name}',
        passed: allPassed,
        gates: results.map(({ name, passed, duration }) => ({ name, passed, duration })),
      },
      null,
      2
    )
  )
} else {
  console.log()
  console.log(allPassed ? 'All quality gates passed.' : 'Some quality gates failed.')
}

process.exit(allPassed ? 0 : 1)
`,
    targetDir,
    opts
  )

  // ── scripts/doctor.sh (templated) ─────────────────────────────────
  writeFileExternal(
    join(targetDir, 'scripts', 'doctor.sh'),
    `#!/usr/bin/env bash
# Environment Doctor — validates development prerequisites for ${name}.
# Scaffolded from ripple-next golden path.
set -euo pipefail

ERRORS=0

check() {
  local label="$1" cmd="$2" expected="$3"
  local actual
  actual=$(eval "$cmd" 2>/dev/null || echo "NOT FOUND")
  if [[ "$actual" == *"$expected"* ]]; then
    echo "  ✅ $label: $actual"
  else
    echo "  ❌ $label: expected $expected, got $actual"
    ERRORS=$((ERRORS + 1))
  fi
}

echo ""
echo "🩺 ${name} — Environment Doctor"
echo "─────────────────────────────────"
echo ""

check "Node.js" "node --version" "v22"
check "pnpm" "pnpm --version" "9."
check "Git" "git --version" "git version"

# Check .env file exists
if [[ -f .env ]]; then
  echo "  ✅ .env file exists"
else
  echo "  ⚠️  .env file not found (copy .env.example to .env)"
fi

echo ""
if [[ $ERRORS -eq 0 ]]; then
  echo "All checks passed."
else
  echo "$ERRORS check(s) failed."
  exit 1
fi
`,
    targetDir,
    opts
  )

  // ── scripts/validate-env.mjs (starter) ────────────────────────────
  writeFileExternal(
    join(targetDir, 'scripts', 'validate-env.mjs'),
    `#!/usr/bin/env node
/**
 * Environment Variable Validator for ${name}.
 * Validates required environment variables are set.
 * Scaffolded from ripple-next golden path.
 *
 * Usage:
 *   pnpm validate:env
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const envPath = resolve(ROOT, '.env')

if (!existsSync(envPath)) {
  console.error('Error: .env file not found. Copy .env.example to .env and fill in values.')
  process.exit(1)
}

const env = readFileSync(envPath, 'utf-8')
const vars = {}
for (const line of env.split('\\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  vars[key.trim()] = rest.join('=').trim()
}

const required = ['NODE_ENV']
const errors = []

for (const key of required) {
  if (!vars[key] && !process.env[key]) {
    errors.push(\`Missing required variable: \${key}\`)
  }
}

if (errors.length > 0) {
  console.error('Environment validation failed:')
  for (const err of errors) console.error(\`  ❌ \${err}\`)
  process.exit(1)
}

console.log('Environment validation passed.')
`,
    targetDir,
    opts
  )
}
