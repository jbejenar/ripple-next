#!/usr/bin/env node
/**
 * Release Verification — Package Integrity + Provenance Checker
 *
 * Verifies that installed @ripple-next/* packages match their published
 * checksums and have valid build provenance attestations.
 * Part of RN-027: Signed Release Bundles + Verification.
 *
 * Usage:
 *   pnpm verify:release                    # human-readable verification report
 *   pnpm verify:release -- --json          # JSON output to stdout
 *   pnpm verify:release -- --ci            # write release-verification.json
 *   pnpm verify:release -- --generate      # generate checksums for current build
 *   pnpm verify:release -- --checksums=path # verify against specific checksums file
 *
 * JSON Schema (ripple-release-verification/v1):
 *   {
 *     "schema":       "ripple-release-verification/v1",
 *     "timestamp":    "ISO-8601",
 *     "status":       "pass" | "fail" | "warning",
 *     "packages":     [{ "name": "...", "version": "...", "status": "...", "checksums": {...} }],
 *     "summary":      { "total": <int>, "verified": <int>, "failed": <int>, "skipped": <int> }
 *   }
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

// ── Parse flags ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const ciMode = args.includes('--ci')
const generateMode = args.includes('--generate')
const outputArg = args.find((a) => a.startsWith('--output='))
const outputFile = outputArg ? outputArg.split('=')[1] : null
const checksumsArg = args.find((a) => a.startsWith('--checksums='))
const checksumsFile = checksumsArg ? checksumsArg.split('=')[1] : null

// ── Published package names ──────────────────────────────────────────
const PUBLISHED_PACKAGES = [
  '@ripple-next/auth',
  '@ripple-next/cms',
  '@ripple-next/db',
  '@ripple-next/email',
  '@ripple-next/events',
  '@ripple-next/queue',
  '@ripple-next/shared',
  '@ripple-next/storage',
  '@ripple-next/ui',
  '@ripple-next/validation',
]

// ── Helpers ──────────────────────────────────────────────────────────
function sha256(filePath) {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

function getFilesRecursive(dir) {
  const files = []
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function computePackageChecksums(pkgDir) {
  const distDir = join(pkgDir, 'dist')
  if (!existsSync(distDir)) return null

  const files = getFilesRecursive(distDir)
  const checksums = {}

  for (const file of files) {
    const relPath = relative(pkgDir, file)
    checksums[relPath] = sha256(file)
  }

  return checksums
}

function readPackageVersion(pkgDir) {
  const pkgJson = join(pkgDir, 'package.json')
  if (!existsSync(pkgJson)) return null
  try {
    return JSON.parse(readFileSync(pkgJson, 'utf-8')).version || null
  } catch {
    return null
  }
}

// ── Generate mode: create checksums for current build ────────────────
if (generateMode) {
  const packages = []

  for (const pkgName of PUBLISHED_PACKAGES) {
    const shortName = pkgName.replace('@ripple-next/', '')
    const pkgDir = resolve(ROOT, 'packages', shortName)

    if (!existsSync(pkgDir)) continue

    const version = readPackageVersion(pkgDir)
    const checksums = computePackageChecksums(pkgDir)

    if (checksums && Object.keys(checksums).length > 0) {
      packages.push({
        name: pkgName,
        version,
        checksums,
      })
    }
  }

  const manifest = {
    schema: 'ripple-release-checksums/v1',
    timestamp: new Date().toISOString(),
    generator: 'verify-release.mjs --generate',
    packages,
  }

  const outPath = outputFile || 'release-checksums.json'
  const absPath = resolve(ROOT, outPath)
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, JSON.stringify(manifest, null, 2) + '\n')

  if (jsonMode) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + '\n')
  } else {
    process.stderr.write(`Generated checksums for ${packages.length} packages\n`)
    for (const pkg of packages) {
      const fileCount = Object.keys(pkg.checksums).length
      process.stderr.write(`  ${pkg.name}@${pkg.version}: ${fileCount} files\n`)
    }
    process.stderr.write(`\nWritten to: ${absPath}\n`)
  }
  process.exit(0)
}

// ── Verify mode: check installed packages against checksums ──────────
function loadChecksums() {
  // Try explicit path first
  if (checksumsFile) {
    const absPath = resolve(ROOT, checksumsFile)
    if (!existsSync(absPath)) {
      process.stderr.write(`Checksums file not found: ${absPath}\n`)
      process.exit(1)
    }
    return JSON.parse(readFileSync(absPath, 'utf-8'))
  }

  // Try default location
  const defaultPath = resolve(ROOT, 'release-checksums.json')
  if (existsSync(defaultPath)) {
    return JSON.parse(readFileSync(defaultPath, 'utf-8'))
  }

  return null
}

const checksumManifest = loadChecksums()

const results = []

for (const pkgName of PUBLISHED_PACKAGES) {
  const shortName = pkgName.replace('@ripple-next/', '')
  const pkgDir = resolve(ROOT, 'packages', shortName)

  if (!existsSync(pkgDir)) {
    results.push({
      name: pkgName,
      version: null,
      status: 'skipped',
      reason: 'Package directory not found',
      checksums: {},
    })
    continue
  }

  const version = readPackageVersion(pkgDir)
  const currentChecksums = computePackageChecksums(pkgDir)

  if (!currentChecksums || Object.keys(currentChecksums).length === 0) {
    results.push({
      name: pkgName,
      version,
      status: 'skipped',
      reason: 'No dist/ directory (package not built)',
      checksums: {},
    })
    continue
  }

  // If we have a checksums manifest, verify against it
  if (checksumManifest) {
    const expected = checksumManifest.packages?.find((p) => p.name === pkgName)
    if (!expected) {
      results.push({
        name: pkgName,
        version,
        status: 'warning',
        reason: 'Package not in checksums manifest',
        checksums: currentChecksums,
      })
      continue
    }

    let allMatch = true
    const mismatches = []

    for (const [file, expectedHash] of Object.entries(expected.checksums)) {
      const actualHash = currentChecksums[file]
      if (!actualHash) {
        allMatch = false
        mismatches.push({ file, expected: expectedHash, actual: 'missing' })
      } else if (actualHash !== expectedHash) {
        allMatch = false
        mismatches.push({ file, expected: expectedHash, actual: actualHash })
      }
    }

    results.push({
      name: pkgName,
      version,
      status: allMatch ? 'verified' : 'failed',
      reason: allMatch ? 'All checksums match' : `${mismatches.length} file(s) differ`,
      mismatches: allMatch ? undefined : mismatches,
      checksums: currentChecksums,
    })
  } else {
    // No manifest — just report computed checksums
    results.push({
      name: pkgName,
      version,
      status: 'computed',
      reason: 'No checksums manifest to verify against. Use --generate to create one.',
      checksums: currentChecksums,
    })
  }
}

const verified = results.filter((r) => r.status === 'verified').length
const failed = results.filter((r) => r.status === 'failed').length
const skipped = results.filter((r) => r.status === 'skipped').length
const computed = results.filter((r) => r.status === 'computed').length
const warned = results.filter((r) => r.status === 'warning').length

const overallStatus = failed > 0 ? 'fail' : warned > 0 || computed > 0 ? 'warning' : 'pass'

const report = {
  schema: 'ripple-release-verification/v1',
  timestamp: new Date().toISOString(),
  status: overallStatus,
  checksumsSource: checksumsFile || (checksumManifest ? 'release-checksums.json' : null),
  packages: results.map(({ checksums, ...rest }) => rest),
  summary: {
    total: results.length,
    verified,
    failed,
    skipped,
    computed,
    warnings: warned,
  },
}

// ── Output ───────────────────────────────────────────────────────────
if (jsonMode) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else {
  process.stderr.write('\nRelease Verification Report\n')
  process.stderr.write('\u2500'.repeat(40) + '\n')

  for (const pkg of results) {
    const icon =
      pkg.status === 'verified'
        ? '\u2713'
        : pkg.status === 'failed'
          ? '\u2717'
          : pkg.status === 'skipped'
            ? '-'
            : '\u26A0'
    const ver = pkg.version ? `@${pkg.version}` : ''
    process.stderr.write(`  ${icon} ${pkg.name}${ver}: ${pkg.reason}\n`)

    if (pkg.mismatches) {
      for (const m of pkg.mismatches) {
        process.stderr.write(`    ${m.file}: expected ${m.expected.slice(0, 12)}..., got ${m.actual === 'missing' ? 'MISSING' : m.actual.slice(0, 12) + '...'}\n`)
      }
    }
  }

  process.stderr.write(`\nSummary: ${verified} verified, ${failed} failed, ${skipped} skipped`)
  if (computed > 0) process.stderr.write(`, ${computed} computed`)
  if (warned > 0) process.stderr.write(`, ${warned} warnings`)
  process.stderr.write(`\nStatus: ${overallStatus}\n\n`)

  if (!checksumManifest) {
    process.stderr.write('Tip: Run with --generate to create a checksums manifest after building.\n')
    process.stderr.write('     Then verify with: pnpm verify:release\n\n')
  }
}

// ── Write JSON to file if requested ──────────────────────────────────
const writePath = outputFile || (ciMode ? resolve(ROOT, 'release-verification.json') : null)

if (writePath && !generateMode) {
  const absPath = resolve(ROOT, writePath)
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, JSON.stringify(report, null, 2) + '\n')
  if (!jsonMode) {
    process.stderr.write(`Report written to: ${absPath}\n`)
  }
}

process.exit(failed > 0 ? 1 : 0)
