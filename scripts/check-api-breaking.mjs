#!/usr/bin/env node
/**
 * API Breaking-Change Detection — compares current OpenAPI spec against a baseline.
 * Implements RN-025: Contract Testing Across Consumers (ADR-021 Phase 4).
 *
 * Usage:
 *   pnpm check:api-breaking                  # compare against main branch
 *   pnpm check:api-breaking -- --base=HEAD~1 # compare against specific ref
 *   pnpm check:api-breaking -- --json        # machine-readable JSON output
 *   pnpm check:api-breaking -- --ci          # write report to api-breaking-report.json
 *
 * Exit codes:
 *   0 — no breaking changes (or no baseline available)
 *   1 — breaking changes detected in public API
 *
 * Error taxonomy codes:
 *   RPL-API-002 — Breaking change detected in public API
 *   RPL-API-003 — Non-breaking API change detected (informational)
 *
 * Zero external dependencies — uses only Node.js built-ins + git.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const SPEC_PATH = resolve(ROOT, 'docs/api/openapi.json')

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const baseArg = args.find((a) => a.startsWith('--base='))
const baseRef = baseArg ? baseArg.split('=')[1] : 'main'

// ── Helpers ──────────────────────────────────────────────────────────

function log(msg) {
  if (!jsonMode) console.error(msg)
}

/**
 * Load the current (working tree) OpenAPI spec.
 */
function loadCurrentSpec() {
  if (!existsSync(SPEC_PATH)) return null
  return JSON.parse(readFileSync(SPEC_PATH, 'utf-8'))
}

/**
 * Load the baseline OpenAPI spec from a git ref.
 * Returns null if the spec doesn't exist at that ref.
 */
function loadBaselineSpec(ref) {
  try {
    const output = execFileSync('git', ['show', `${ref}:docs/api/openapi.json`], {
      encoding: 'utf-8',
      cwd: ROOT,
      timeout: 10_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return JSON.parse(output)
  } catch {
    return null
  }
}

/**
 * Extract all paths and their methods from an OpenAPI spec.
 * Returns a Map<string, PathInfo> where PathInfo contains methods and their details.
 */
function extractEndpoints(spec) {
  const endpoints = new Map()
  if (!spec?.paths) return endpoints

  for (const [path, methods] of Object.entries(spec.paths)) {
    const methodMap = new Map()
    for (const [method, details] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        methodMap.set(method, details)
      }
    }
    endpoints.set(path, methodMap)
  }

  return endpoints
}

/**
 * Get required properties from a schema object.
 */
function getRequiredProps(schema) {
  if (!schema || typeof schema !== 'object') return new Set()
  return new Set(Array.isArray(schema.required) ? schema.required : [])
}

/**
 * Get the request body schema from an operation.
 */
function getRequestBodySchema(operation) {
  return operation?.requestBody?.content?.['application/json']?.schema ?? null
}

/**
 * Get required parameters from an operation.
 */
function getRequiredParams(operation) {
  if (!Array.isArray(operation?.parameters)) return []
  return operation.parameters.filter((p) => p.required).map((p) => ({ name: p.name, in: p.in }))
}

/**
 * Get response status codes from an operation.
 */
function getResponseCodes(operation) {
  if (!operation?.responses) return new Set()
  return new Set(Object.keys(operation.responses))
}

// ── Breaking-change detection ────────────────────────────────────────

/**
 * Compare two OpenAPI specs and return a list of changes.
 * Each change has: { type, severity, path, method, detail }
 */
function detectChanges(baseline, current) {
  const changes = []
  const baseEndpoints = extractEndpoints(baseline)
  const currEndpoints = extractEndpoints(current)

  // 1. Detect removed paths
  for (const [path, baseMethods] of baseEndpoints) {
    if (!currEndpoints.has(path)) {
      for (const [method, details] of baseMethods) {
        changes.push({
          type: 'path-removed',
          severity: 'breaking',
          path,
          method: method.toUpperCase(),
          operationId: details.operationId ?? null,
          detail: `Endpoint removed: ${method.toUpperCase()} ${path}`,
        })
      }
      continue
    }

    const currMethods = currEndpoints.get(path)

    // 2. Detect removed methods on existing paths
    for (const [method, baseOp] of baseMethods) {
      if (!currMethods.has(method)) {
        changes.push({
          type: 'method-removed',
          severity: 'breaking',
          path,
          method: method.toUpperCase(),
          operationId: baseOp.operationId ?? null,
          detail: `Method removed: ${method.toUpperCase()} ${path}`,
        })
        continue
      }

      const currOp = currMethods.get(method)

      // 3. Detect operationId changes
      if (baseOp.operationId && currOp.operationId && baseOp.operationId !== currOp.operationId) {
        changes.push({
          type: 'operation-id-changed',
          severity: 'breaking',
          path,
          method: method.toUpperCase(),
          operationId: baseOp.operationId,
          detail: `operationId changed: ${baseOp.operationId} → ${currOp.operationId}`,
        })
      }

      // 4. Detect added required request body fields
      const baseSchema = getRequestBodySchema(baseOp)
      const currSchema = getRequestBodySchema(currOp)

      if (currSchema) {
        const baseRequired = getRequiredProps(baseSchema)
        const currRequired = getRequiredProps(currSchema)

        for (const field of currRequired) {
          if (!baseRequired.has(field)) {
            changes.push({
              type: 'required-field-added',
              severity: 'breaking',
              path,
              method: method.toUpperCase(),
              operationId: currOp.operationId ?? null,
              detail: `New required request field: "${field}"`,
            })
          }
        }
      }

      // 5. Detect added required parameters
      const baseParams = getRequiredParams(baseOp)
      const currParams = getRequiredParams(currOp)
      const baseParamKeys = new Set(baseParams.map((p) => `${p.in}:${p.name}`))

      for (const param of currParams) {
        const key = `${param.in}:${param.name}`
        if (!baseParamKeys.has(key)) {
          changes.push({
            type: 'required-param-added',
            severity: 'breaking',
            path,
            method: method.toUpperCase(),
            operationId: currOp.operationId ?? null,
            detail: `New required ${param.in} parameter: "${param.name}"`,
          })
        }
      }

      // 6. Detect removed response status codes
      const baseResponses = getResponseCodes(baseOp)
      const currResponses = getResponseCodes(currOp)

      for (const code of baseResponses) {
        if (!currResponses.has(code)) {
          changes.push({
            type: 'response-code-removed',
            severity: 'breaking',
            path,
            method: method.toUpperCase(),
            operationId: baseOp.operationId ?? null,
            detail: `Response status code removed: ${code}`,
          })
        }
      }
    }
  }

  // 7. Detect added paths/methods (non-breaking)
  for (const [path, currMethods] of currEndpoints) {
    if (!baseEndpoints.has(path)) {
      for (const [method, details] of currMethods) {
        changes.push({
          type: 'path-added',
          severity: 'non-breaking',
          path,
          method: method.toUpperCase(),
          operationId: details.operationId ?? null,
          detail: `New endpoint: ${method.toUpperCase()} ${path}`,
        })
      }
      continue
    }

    const baseMethods = baseEndpoints.get(path)
    for (const [method, details] of currMethods) {
      if (!baseMethods.has(method)) {
        changes.push({
          type: 'method-added',
          severity: 'non-breaking',
          path,
          method: method.toUpperCase(),
          operationId: details.operationId ?? null,
          detail: `New method: ${method.toUpperCase()} ${path}`,
        })
      }
    }
  }

  return changes
}

// ── Main ─────────────────────────────────────────────────────────────

log('API Breaking-Change Detection (ADR-021, RN-025)')
log('─────────────────────────────────────────────────')

const currentSpec = loadCurrentSpec()

if (!currentSpec) {
  log('  ○ No OpenAPI spec at docs/api/openapi.json — gate inactive')
  log('  ○ Generate with: pnpm generate:openapi')
  process.exit(0)
}

log(`  Baseline: ${baseRef}`)

const baselineSpec = loadBaselineSpec(baseRef)

if (!baselineSpec) {
  log(`  ○ No baseline spec found at ref "${baseRef}" — skipping breaking-change check`)
  log('  ○ This is expected for the first release or new branches')

  const report = {
    schema: 'ripple-api-breaking/v1',
    timestamp: new Date().toISOString(),
    status: 'pass',
    baseRef,
    baseline: 'not-found',
    breaking: 0,
    nonBreaking: 0,
    changes: [],
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  }

  if (ciMode) {
    writeFileSync(resolve(ROOT, 'api-breaking-report.json'), JSON.stringify(report, null, 2) + '\n')
  }

  process.exit(0)
}

const changes = detectChanges(baselineSpec, currentSpec)
const breaking = changes.filter((c) => c.severity === 'breaking')
const nonBreaking = changes.filter((c) => c.severity === 'non-breaking')
const status = breaking.length > 0 ? 'fail' : 'pass'

const report = {
  schema: 'ripple-api-breaking/v1',
  timestamp: new Date().toISOString(),
  status,
  baseRef,
  baseline: 'found',
  currentVersion: currentSpec.info?.version ?? 'unknown',
  baselineVersion: baselineSpec.info?.version ?? 'unknown',
  breaking: breaking.length,
  nonBreaking: nonBreaking.length,
  changes,
}

if (jsonMode) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else {
  if (breaking.length > 0) {
    log('')
    log(`  ✗ ${breaking.length} breaking change(s) detected (RPL-API-002)`)
    for (const change of breaking) {
      log(`    • ${change.detail}`)
    }
    log('')
    log('  Remediation:')
    log('    - Bump the API version (/v1/ → /v2/) and add migration notes')
    log('    - Or mark old endpoints as deprecated and add new ones alongside')
    log('    - See ADR-021 for versioning and deprecation policy')
  }

  if (nonBreaking.length > 0) {
    log('')
    log(`  ○ ${nonBreaking.length} non-breaking change(s) (RPL-API-003)`)
    for (const change of nonBreaking) {
      log(`    • ${change.detail}`)
    }
  }

  if (changes.length === 0) {
    log('  ✓ No API changes detected')
  }

  log('')
  log(`  Status: ${status}`)
}

// Write report for CI artifacts
const writePath = ciMode ? resolve(ROOT, 'api-breaking-report.json') : null
if (writePath) {
  mkdirSync(dirname(writePath), { recursive: true })
  writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n')
  if (!jsonMode) {
    log(`  Report written to: ${writePath}`)
  }
}

process.exit(breaking.length > 0 ? 1 : 0)
