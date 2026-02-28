#!/usr/bin/env node
/**
 * IaC Policy Scanner for SST Config — RN-036
 *
 * Performs static analysis on sst.config.ts against a defined policy set.
 * Outputs machine-readable JSON diagnostics with violation codes, severity,
 * and remediation guidance.
 *
 * Usage:
 *   pnpm check:iac                  # human-readable output
 *   pnpm check:iac -- --json        # JSON report to stdout
 *   pnpm check:iac -- --ci          # write iac-policy-report.json for CI
 *
 * Exit codes:
 *   0 — no errors (warnings allowed)
 *   1 — one or more error-severity violations found
 *
 * JSON Schema (ripple-iac-report/v1):
 *   {
 *     "schema":      "ripple-iac-report/v1",
 *     "timestamp":   "ISO-8601",
 *     "configFile":  "sst.config.ts",
 *     "status":      "pass" | "fail" | "warn",
 *     "violations":  [...],
 *     "exceptions":  [...],
 *     "summary":     { errors, warnings, exceptions, policiesChecked }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIG_PATH = resolve(ROOT, 'sst.config.ts')
const POLICIES_PATH = resolve(ROOT, 'docs/iac-policies.json')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const outputArg = args.find((a) => a.startsWith('--output='))

// ── Load inputs ──────────────────────────────────────────────────────
let configContent
try {
  configContent = readFileSync(CONFIG_PATH, 'utf-8')
} catch {
  const msg = `Error: sst.config.ts not found at ${CONFIG_PATH}`
  if (jsonMode || ciMode) {
    const report = {
      schema: 'ripple-iac-report/v1',
      timestamp: new Date().toISOString(),
      configFile: 'sst.config.ts',
      status: 'fail',
      violations: [{ policyId: 'IAC-000', message: msg, severity: 'error' }],
      exceptions: [],
      summary: { errors: 1, warnings: 0, exceptions: 0, policiesChecked: 0 }
    }
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  } else {
    console.error(msg)
  }
  process.exit(1)
}

const policies = JSON.parse(readFileSync(POLICIES_PATH, 'utf-8'))
const lines = configContent.split('\n')

// ── Parse exception comments ─────────────────────────────────────────
const EXCEPTION_RE = /\/\/\s*iac-policy-exception:\s*(IAC-\d+)\s*—\s*(.+)/
const exceptions = []
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(EXCEPTION_RE)
  if (match) {
    exceptions.push({
      policyId: match[1],
      justification: match[2].trim(),
      line: i + 1
    })
  }
}

const exceptionIds = new Set(exceptions.map((e) => e.policyId))

// ── Policy checks ────────────────────────────────────────────────────
const violations = []

function addViolation(policyId, message, line, severity) {
  if (exceptionIds.has(policyId)) return
  const policy = policies.policies.find((p) => p.id === policyId)
  violations.push({
    policyId,
    taxonomyCode: policy?.taxonomyCode ?? `RPL-${policyId}`,
    severity: severity ?? policy?.severity ?? 'error',
    message,
    line,
    remediation: getRemediation(policyId)
  })
}

function getRemediation(policyId) {
  const remediations = {
    'IAC-001': [
      "Ensure app() returns removal: 'retain' and protect: true for production stage",
      "Pattern: removal: input?.stage === 'production' ? 'retain' : 'remove'",
      "Pattern: protect: input?.stage === 'production'"
    ],
    'IAC-002': [
      "Replace allowOrigins: ['*'] with specific domain origins",
      "Example: allowOrigins: ['https://example.vic.gov.au']",
      'Or add exception: // iac-policy-exception: IAC-002 — <justification>'
    ],
    'IAC-003': [
      'Ensure public-facing services use HTTPS (port 443)',
      "Pattern: listen: '443/https'",
      'Do not expose HTTP (port 80) publicly'
    ],
    'IAC-004': [
      'Set reasonable scaling bounds for ECS services and databases',
      'ECS: max should not exceed 50 instances',
      'Database: max ACU should not exceed 32'
    ],
    'IAC-005': [
      'Lambda timeout must not exceed 15 minutes',
      'For longer workloads, use ECS Fargate instead',
      'See docs/lambda-vs-ecs.md for the compute decision framework'
    ],
    'IAC-006': [
      'Use SST Resource linking instead of hardcoded ARNs',
      "Pattern: link: [resource] instead of arn: 'arn:aws:...'",
      'Never embed AWS account IDs in configuration'
    ],
    'IAC-007': [
      'Database and cache resources must reference the VPC',
      'Pattern: new sst.aws.Postgres("Name", { vpc })',
      'Pattern: new sst.aws.Redis("Name", { vpc })'
    ]
  }
  return remediations[policyId] ?? ['Review the policy definition in docs/iac-policies.json']
}

// ── IAC-001: Production protection flags ─────────────────────────────
function checkProductionProtection() {
  // Accept both literal values and conditional expressions referencing production
  const hasRetain = /removal:\s*.*'retain'/.test(configContent)
  const hasProtect =
    /protect:\s*true/.test(configContent) ||
    /protect:\s*input\??\.\s*stage\s*===\s*'production'/.test(configContent)

  if (!hasRetain) {
    const lineNum = findLine(/removal:/) || findLine(/app\(/)
    addViolation(
      'IAC-001',
      "Production stage missing removal: 'retain' — resources may be deleted on stack removal",
      lineNum
    )
  }
  if (!hasProtect) {
    const lineNum = findLine(/protect:/) || findLine(/app\(/)
    addViolation(
      'IAC-001',
      'Production stage missing protect: true — resources may be accidentally deleted',
      lineNum ?? 1
    )
  }
}

// ── IAC-002: No wildcard CORS ────────────────────────────────────────
function checkWildcardCors() {
  for (let i = 0; i < lines.length; i++) {
    if (/allowOrigins:\s*\[\s*(['"])?\*\1?\s*\]/.test(lines[i])) {
      addViolation(
        'IAC-002',
        "S3 bucket uses wildcard CORS origins (allowOrigins: ['*'])",
        i + 1,
        'warning'
      )
    }
  }
}

// ── IAC-003: Public services HTTPS only ──────────────────────────────
function checkPublicServicesHttps() {
  // Look for public port definitions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Match port definitions like listen: '80/http' or listen: '8080/http'
    if (/listen:\s*['"](\d+)\/http['"]/.test(line)) {
      const match = line.match(/listen:\s*['"](\d+)\/http['"]/)
      if (match && match[1] !== '443') {
        addViolation('IAC-003', `Public service listens on HTTP port ${match[1]} instead of HTTPS`, i + 1)
      }
    }
  }
}

// ── IAC-004: Bounded scaling ─────────────────────────────────────────
function checkBoundedScaling() {
  const limits = policies.policies.find((p) => p.id === 'IAC-004')?.limits ?? {
    ecsMaxInstances: 50,
    dbMaxACU: 32
  }

  // Check ECS scaling max
  const scalingMaxRe = /max:\s*(\d+)/g
  let inScaling = false
  for (let i = 0; i < lines.length; i++) {
    if (/scaling:\s*\{/.test(lines[i])) inScaling = true
    if (inScaling) {
      const match = lines[i].match(/max:\s*(\d+)/)
      if (match) {
        const maxVal = parseInt(match[1], 10)
        if (maxVal > limits.ecsMaxInstances) {
          addViolation(
            'IAC-004',
            `ECS scaling max (${maxVal}) exceeds limit (${limits.ecsMaxInstances})`,
            i + 1,
            'warning'
          )
        }
        inScaling = false
      }
    }

    // Check DB ACU scaling
    const acuMatch = lines[i].match(/max:\s*['"](\d+(?:\.\d+)?)\s*ACU['"]/)
    if (acuMatch) {
      const maxACU = parseFloat(acuMatch[1])
      if (maxACU > limits.dbMaxACU) {
        addViolation(
          'IAC-004',
          `Database scaling max (${maxACU} ACU) exceeds limit (${limits.dbMaxACU} ACU)`,
          i + 1,
          'warning'
        )
      }
    }
  }
}

// ── IAC-005: Lambda timeout limit ────────────────────────────────────
function checkLambdaTimeouts() {
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/timeout:\s*['"](\d+)\s*(minutes?|hours?)['"]/)
    if (match) {
      const value = parseInt(match[1], 10)
      const unit = match[2]
      let minutes = value
      if (unit.startsWith('hour')) minutes = value * 60

      if (minutes > 15) {
        // Check if this is within a cluster/ECS service context (allowed)
        const contextStart = Math.max(0, i - 20)
        const context = lines.slice(contextStart, i).join('\n')
        if (/addService|Cluster|cluster/.test(context)) {
          // ECS service — long timeouts are expected, skip
          continue
        }
        addViolation(
          'IAC-005',
          `Lambda timeout (${value} ${unit}) exceeds 15-minute limit — use ECS Fargate instead`,
          i + 1,
          'warning'
        )
      }
    }
  }
}

// ── IAC-006: No hardcoded ARNs ───────────────────────────────────────
function checkHardcodedArns() {
  const arnRe = /arn:aws:[a-z0-9-]+:[a-z0-9-]*:\d{12}:/
  const accountIdRe = /['"](\d{12})['"]/
  for (let i = 0; i < lines.length; i++) {
    // Skip comments
    if (/^\s*\/\//.test(lines[i])) continue

    if (arnRe.test(lines[i])) {
      addViolation('IAC-006', 'Hardcoded AWS ARN found — use SST Resource linking', i + 1)
    }

    const acctMatch = lines[i].match(accountIdRe)
    if (acctMatch) {
      // Rough check: 12-digit number that looks like an AWS account ID
      const num = acctMatch[1]
      // Exclude common non-account patterns (ports, timeouts, etc.)
      if (!/port|timeout|interval|retries|retention|warm/i.test(lines[i])) {
        addViolation('IAC-006', `Possible hardcoded AWS account ID (${num})`, i + 1)
      }
    }
  }
}

// ── IAC-007: VPC for data resources ──────────────────────────────────
function checkVpcDataResources() {
  // Check that Postgres and Redis reference vpc
  const postgresRe = /new\s+sst\.aws\.Postgres\s*\(/
  const redisRe = /new\s+sst\.aws\.Redis\s*\(/

  for (let i = 0; i < lines.length; i++) {
    if (postgresRe.test(lines[i]) || redisRe.test(lines[i])) {
      // Look ahead for vpc reference in the constructor options
      const resourceType = postgresRe.test(lines[i]) ? 'Postgres' : 'Redis'
      const lookahead = lines.slice(i, Math.min(i + 10, lines.length)).join('\n')
      if (!/\bvpc\b/.test(lookahead)) {
        addViolation(
          'IAC-007',
          `${resourceType} resource created without VPC — must be deployed within a VPC`,
          i + 1
        )
      }
    }
  }
}

// ── Utility ──────────────────────────────────────────────────────────
function findLine(re) {
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i + 1
  }
  return null
}

// ── Run all checks ──────────────────────────────────────────────────
checkProductionProtection()
checkWildcardCors()
checkPublicServicesHttps()
checkBoundedScaling()
checkLambdaTimeouts()
checkHardcodedArns()
checkVpcDataResources()

// ── Build report ─────────────────────────────────────────────────────
const errors = violations.filter((v) => v.severity === 'error')
const warnings = violations.filter((v) => v.severity === 'warning')

const status = errors.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass'

const report = {
  schema: 'ripple-iac-report/v1',
  timestamp: new Date().toISOString(),
  configFile: 'sst.config.ts',
  status,
  violations,
  exceptions,
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    exceptions: exceptions.length,
    policiesChecked: policies.policies.length
  }
}

// ── Output ───────────────────────────────────────────────────────────
if (jsonMode || ciMode) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
}

if (ciMode || outputArg) {
  const outPath = outputArg
    ? resolve(ROOT, outputArg.split('=')[1])
    : resolve(ROOT, 'iac-policy-report.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n')
  if (!jsonMode) {
    console.error(`Report written to ${outPath}`)
  }
}

if (!jsonMode) {
  // Human-readable output
  console.error('')
  console.error('IaC Policy Scan — sst.config.ts')
  console.error('────────────────────────────────')
  console.error('')

  if (violations.length === 0 && exceptions.length === 0) {
    console.error(`  ✓ All ${policies.policies.length} policies passed`)
  }

  for (const v of violations) {
    const icon = v.severity === 'error' ? '✗' : '⚠'
    console.error(`  ${icon} [${v.policyId}] ${v.message} (line ${v.line})`)
  }

  for (const e of exceptions) {
    console.error(`  ⊘ [${e.policyId}] Exception at line ${e.line}: ${e.justification}`)
  }

  console.error('')
  console.error('────────────────────────────────')
  console.error(
    `Results: ${policies.policies.length - violations.length} passed, ` +
      `${errors.length} error(s), ${warnings.length} warning(s), ` +
      `${exceptions.length} exception(s)`
  )

  if (errors.length > 0) {
    console.error('')
    console.error('Remediation:')
    for (const v of errors) {
      console.error(`  [${v.policyId}] ${v.remediation[0]}`)
    }
  }

  console.error('')
}

// Exit with error only if error-severity violations exist
process.exit(errors.length > 0 ? 1 : 0)
