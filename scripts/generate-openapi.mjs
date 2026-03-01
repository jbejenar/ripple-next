#!/usr/bin/env node
/**
 * OpenAPI Spec Generator — produces docs/api/openapi.json from oRPC router.
 * Implements ADR-021: API Contract Strategy.
 *
 * Usage:
 *   pnpm generate:openapi              # generate docs/api/openapi.json
 *   pnpm generate:openapi -- --check   # exit non-zero if committed spec is stale
 *   pnpm generate:openapi -- --stdout  # print to stdout instead of writing file
 *   pnpm generate:openapi -- --public  # only include routes with visibility: 'public'
 *
 * Exit codes:
 *   0 — spec generated (or --check passed)
 *   1 — --check failed (committed spec is stale) or generation error
 *   2 — oRPC router not yet available (pre-migration); exits cleanly
 *
 * Pre-migration behaviour (Phase 1):
 *   Before oRPC is installed and routers migrated, this script exits with
 *   code 0 and a warning. The gate activates automatically once
 *   docs/api/openapi.json exists in the repo.
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SPEC_PATH = resolve(ROOT, 'docs/api/openapi.json')

const args = process.argv.slice(2)
const checkMode = args.includes('--check')
const stdoutMode = args.includes('--stdout')
const publicOnly = args.includes('--public')

/**
 * Attempt to load and generate the OpenAPI spec from the oRPC router.
 * Returns the spec object, or null if oRPC is not yet set up.
 */
async function generateSpec() {
  // Phase 1: oRPC is not installed yet. Check for the router entry point.
  const routerPath = resolve(ROOT, 'apps/web/server/orpc/router.ts')
  const routerPathJs = resolve(ROOT, 'apps/web/server/orpc/router.js')

  if (!existsSync(routerPath) && !existsSync(routerPathJs)) {
    return null
  }

  // Phase 2+: oRPC router exists. Dynamically import and generate.
  // Uses tsx to handle TypeScript imports from the oRPC router.
  try {
    const { execFileSync } = await import('node:child_process')
    const { writeFileSync, unlinkSync } = await import('node:fs')
    const tmpScript = resolve(ROOT, 'scripts/.generate-openapi-runner.mts')
    writeFileSync(tmpScript, [
      `import { generateOpenAPI } from '${routerPath.replace(/\\/g, '/')}'`,
      `const spec = await generateOpenAPI({ publicOnly: ${publicOnly} })`,
      `process.stdout.write(JSON.stringify(spec))`,
    ].join('\n'))
    try {
      const tsxBin = resolve(ROOT, 'node_modules/.bin/tsx')
      const output = execFileSync(tsxBin, [tmpScript], {
        encoding: 'utf-8',
        cwd: ROOT,
        timeout: 30_000,
        env: { ...process.env, NODE_NO_WARNINGS: '1' }
      })
      return JSON.parse(output)
    } finally {
      try { unlinkSync(tmpScript) } catch { /* ignore cleanup errors */ }
    }
  } catch (err) {
    console.error(`Error generating OpenAPI spec: ${err.message}`)
    process.exit(1)
  }
}

/**
 * Normalise spec to deterministic JSON (sorted keys at every level, 2-space indent).
 */
function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortKeys(obj[key])
      return sorted
    }, {})
  }
  return obj
}

function serialise(spec) {
  return JSON.stringify(sortKeys(spec), null, 2) + '\n'
}

// ── Main ──────────────────────────────────────────────────────────────
const spec = await generateSpec()

if (spec === null) {
  // Pre-migration: oRPC router does not exist yet
  if (checkMode) {
    // In check mode, only fail if a committed spec exists but can't be validated
    if (existsSync(SPEC_PATH)) {
      console.error('OpenAPI spec exists at docs/api/openapi.json but oRPC router not found.')
      console.error('Either migrate to oRPC (RN-046) or remove the stale spec.')
      process.exit(1)
    }
    // No spec, no router — nothing to check
    process.exit(0)
  }

  console.warn('oRPC router not found at apps/web/server/orpc/router.ts')
  console.warn('This script activates after RN-046 migration. See ADR-021.')
  process.exit(0)
}

const specJson = serialise(spec)

if (stdoutMode) {
  process.stdout.write(specJson)
  process.exit(0)
}

if (checkMode) {
  if (!existsSync(SPEC_PATH)) {
    console.error('No committed OpenAPI spec at docs/api/openapi.json')
    console.error('Run: pnpm generate:openapi')
    process.exit(1)
  }

  const committed = readFileSync(SPEC_PATH, 'utf-8')
  if (committed === specJson) {
    console.log('OpenAPI spec is up to date.')
    process.exit(0)
  } else {
    console.error('OpenAPI spec is stale. Run: pnpm generate:openapi')
    process.exit(1)
  }
}

// Default: write the spec
mkdirSync(dirname(SPEC_PATH), { recursive: true })
writeFileSync(SPEC_PATH, specJson)
console.log(`OpenAPI spec written to docs/api/openapi.json`)
