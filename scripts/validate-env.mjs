#!/usr/bin/env node
/**
 * Environment Schema Validation Gate
 *
 * Validates environment variables against the contract defined in .env.example.
 * Self-contained (no external dependencies) so it works pre-install.
 *
 * For programmatic Zod-based validation, use @ripple/validation envSchema.
 *
 * Usage:
 *   node scripts/validate-env.mjs          # human-readable output
 *   node scripts/validate-env.mjs --json   # machine-readable JSON output
 *
 * Exit codes:
 *   0 — all required env vars are valid
 *   1 — one or more required env vars are missing or invalid
 *
 * Integration:
 *   - Called by `pnpm doctor` (env validation section)
 *   - Can be called standalone: `pnpm validate:env`
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const JSON_MODE = process.argv.includes('--json')

// Load .env file if it exists (does not override existing env vars).
// Minimal parser — no external dependency needed.
const envFile = join(ROOT, '.env')
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

// ── Validation rules (self-contained, mirrors @ripple/validation env schema) ──

/** @type {{ key: string, check: (v: string | undefined) => string | null }[]} */
const requiredChecks = [
  {
    key: 'DATABASE_URL',
    check: (v) => {
      if (!v) return 'Required — PostgreSQL connection string'
      if (!v.startsWith('postgres')) return 'Must be a PostgreSQL connection string (starts with postgres://)'
      return null
    },
  },
  {
    key: 'NUXT_DATABASE_URL',
    check: (v) => {
      if (!v) return 'Required — PostgreSQL connection string for Nuxt runtime'
      if (!v.startsWith('postgres')) return 'Must be a PostgreSQL connection string (starts with postgres://)'
      return null
    },
  },
  {
    key: 'REDIS_URL',
    check: (v) => {
      if (!v) return 'Required — Redis connection string'
      if (!v.startsWith('redis')) return 'Must be a Redis connection string (starts with redis://)'
      return null
    },
  },
]

/** @type {{ key: string, check: (v: string | undefined) => string | null }[]} */
const optionalChecks = [
  {
    key: 'NUXT_OIDC_ISSUER_URL',
    check: (v) => {
      if (!v) return null // empty = MockAuthProvider
      try { new URL(v); return null } catch { return 'Must be a valid URL' }
    },
  },
  {
    key: 'NUXT_SESSION_SECRET',
    check: (v) => {
      if (!v) return null
      if (v.length < 16) return 'Session secret must be at least 16 characters'
      return null
    },
  },
  {
    key: 'NUXT_CMS_BASE_URL',
    check: (v) => {
      if (!v) return null // empty = MockCmsProvider
      try { new URL(v); return null } catch { return 'Must be a valid URL' }
    },
  },
  {
    key: 'NODE_ENV',
    check: (v) => {
      if (!v) return null
      if (!['development', 'test', 'production'].includes(v)) return 'Must be development, test, or production'
      return null
    },
  },
]

// ── Run validation ─────────────────────────────────────────────────────
const passed = []
const failed = []
const warnings = []

for (const { key, check } of requiredChecks) {
  const error = check(process.env[key])
  if (error) {
    failed.push({ key, message: error })
  } else {
    passed.push(key)
  }
}

for (const { key, check } of optionalChecks) {
  const value = process.env[key]
  if (value !== undefined && value !== '') {
    const error = check(value)
    if (error) {
      warnings.push({ key, message: error })
    }
  }
}

// ── Output ─────────────────────────────────────────────────────────────
if (JSON_MODE) {
  const result = {
    valid: failed.length === 0,
    passed: passed.length,
    failed: failed.length,
    warnings: warnings.length,
    issues: [
      ...failed.map((f) => ({ ...f, severity: 'error' })),
      ...warnings.map((w) => ({ ...w, severity: 'warning' })),
    ],
  }
  process.stdout.write(JSON.stringify(result) + '\n')
} else {
  // eslint-disable-next-line no-console
  console.log('Environment Schema Validation')
  // eslint-disable-next-line no-console
  console.log('─────────────────────────────')
  // eslint-disable-next-line no-console
  console.log()

  for (const key of passed) {
    // eslint-disable-next-line no-console
    console.log(`  \u2713 ${key}`)
  }
  for (const { key, message } of failed) {
    console.error(`  \u2717 ${key}: ${message}`)
  }
  for (const { key, message } of warnings) {
    // eslint-disable-next-line no-console
    console.log(`  ! ${key}: ${message}`)
  }

  // eslint-disable-next-line no-console
  console.log()
  // eslint-disable-next-line no-console
  console.log(`Results: ${passed.length} passed, ${failed.length} failed, ${warnings.length} warnings`)
}

if (failed.length > 0) {
  if (!JSON_MODE) {
    console.error()
    console.error('Required environment variables are missing or invalid.')
    console.error('Copy .env.example to .env and fill in required values.')
  }
  process.exit(1)
}

process.exit(0)
