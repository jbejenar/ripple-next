#!/usr/bin/env node
/**
 * API Contract Drift Gate — validates committed OpenAPI spec is in sync.
 * Implements ADR-021: API Contract Strategy.
 *
 * Usage:
 *   pnpm check:api-contract   # or: node scripts/check-api-contract.mjs
 *
 * Exit codes:
 *   0 — spec is in sync (or no spec committed yet — pre-migration)
 *   1 — committed spec is stale (drift detected)
 *
 * Pre-migration behaviour:
 *   Before oRPC routers exist, this gate passes silently. It activates
 *   automatically once docs/api/openapi.json is committed to the repo.
 *
 * Error taxonomy codes:
 *   RPL-API-001 — OpenAPI spec drift (committed spec != generated spec)
 *   RPL-API-002 — Breaking change detected in public API
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const SPEC_PATH = resolve(ROOT, 'docs/api/openapi.json')
const ROUTER_PATH = resolve(ROOT, 'apps/web/server/orpc/router.ts')
const ROUTER_PATH_JS = resolve(ROOT, 'apps/web/server/orpc/router.js')

console.log('API Contract Drift Gate (ADR-021)')
console.log('─────────────────────────────────')

// Pre-migration: no router and no spec → nothing to check
if (!existsSync(ROUTER_PATH) && !existsSync(ROUTER_PATH_JS)) {
  if (existsSync(SPEC_PATH)) {
    console.error('  ✗ OpenAPI spec exists but oRPC router not found (RPL-API-001)')
    console.error('    Remediation: Migrate to oRPC (RN-046) or remove stale spec')
    process.exit(1)
  }
  console.log('  ○ oRPC router not yet created — gate inactive (see RN-046)')
  console.log('  ○ This gate activates after oRPC migration')
  console.log()
  process.exit(0)
}

// Router exists — run generate:openapi --check
try {
  execFileSync('node', [resolve(ROOT, 'scripts/generate-openapi.mjs'), '--check'], {
    encoding: 'utf-8',
    stdio: 'pipe',
    cwd: ROOT,
    timeout: 30_000,
  })
  console.log('  ✓ OpenAPI spec is in sync with router definition')
  console.log()
  process.exit(0)
} catch (err) {
  const output = (err.stderr || err.stdout || '').trim()
  console.error(`  ✗ OpenAPI spec drift detected (RPL-API-001)`)
  if (output) {
    console.error(`    ${output}`)
  }
  console.error('    Remediation: Run pnpm generate:openapi and commit the updated spec')
  console.error()
  process.exit(1)
}
