#!/usr/bin/env node
/**
 * Provider Generator — scaffolds a provider class and conformance test registration.
 *
 * Usage:
 *   pnpm generate:provider <package> <name> [--dry-run]
 *
 * Examples:
 *   pnpm generate:provider email resend          # packages/email/providers/resend.ts
 *   pnpm generate:provider storage cloudflare     # packages/storage/providers/cloudflare.ts
 *   pnpm generate:provider queue kafka --dry-run
 *
 * Output files:
 *   packages/{package}/providers/{name}.ts
 *   packages/{package}/tests/{name}.provider.test.ts
 */
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { ROOT, toPascalCase, writeFile, parseArgs } from './lib.mjs'

export function generateProvider(packageName, providerName, options = {}) {
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(packageName) || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(providerName)) {
    throw new Error('Package and provider names must be alphanumeric with optional hyphens')
  }
  const dryRun = options.dryRun || false
  const pascal = toPascalCase(providerName)
  const pkgDir = join(ROOT, 'packages', packageName)

  if (!existsSync(pkgDir)) {
    console.error(`Error: Package "packages/${packageName}" does not exist.`)
    console.error(`Run "pnpm generate:package ${packageName}" first.`)
    process.exit(1)
  }

  // Detect the provider interface name from types.ts
  const typesPath = join(pkgDir, 'types.ts')
  let interfaceName = `${toPascalCase(packageName)}Provider`
  let interfaceImports = interfaceName

  if (existsSync(typesPath)) {
    const typesContent = readFileSync(typesPath, 'utf-8')
    const ifaceMatch = typesContent.match(/export interface (\w+Provider)/)
    if (ifaceMatch) {
      interfaceName = ifaceMatch[1]
    }
    // Collect all exported interfaces/types for the import
    const exports = [...typesContent.matchAll(/export (?:interface|type) (\w+)/g)]
    interfaceImports = exports.map((m) => m[1]).join(', ')
  }

  const className = `${pascal}${toPascalCase(packageName)}Provider`
  const providerDir = join(pkgDir, 'providers')
  const testDir = join(pkgDir, 'tests')

  console.log(`\nGenerating provider: ${className} in packages/${packageName}`)
  console.log('─'.repeat(40))

  // 1. Provider implementation
  writeFile(
    join(providerDir, `${providerName}.ts`),
    `import type { ${interfaceImports} } from '../types'

/**
 * ${pascal} ${toPascalCase(packageName)} provider.
 * TODO: Implement the ${interfaceName} interface.
 */
export class ${className} implements ${interfaceName} {
  constructor(/* TODO: Add constructor parameters */) {
    // TODO: Initialize provider
  }

  // TODO: Implement all interface methods
}
`,
    dryRun
  )

  // 2. Conformance test registration
  const conformancePath = join(ROOT, 'packages/testing/conformance', `${packageName}.conformance.ts`)
  const hasConformance = existsSync(conformancePath)

  writeFile(
    join(testDir, `${providerName}.provider.test.ts`),
    hasConformance
      ? `import { ${packageName}Conformance } from '@ripple-next/testing/conformance/${packageName}.conformance'
import { ${className} } from '../providers/${providerName}'

${packageName}Conformance({
  name: '${className}',
  factory: () => new ${className}(/* TODO: Add config */),
})
`
      : `import { describe, it, expect, beforeEach } from 'vitest'
import { ${className} } from '../providers/${providerName}'

describe('${className}', () => {
  let provider: ${className}

  beforeEach(() => {
    provider = new ${className}(/* TODO: Add config */)
  })

  // TODO: Add provider tests
  it('should be instantiable', () => {
    expect(provider).toBeDefined()
  })
})
`,
    dryRun
  )

  console.log()
  console.log(`Done! Next steps:`)
  console.log(`  1. Implement: packages/${packageName}/providers/${providerName}.ts`)
  console.log(`  2. Add constructor params and implement all interface methods`)
  if (hasConformance) {
    console.log(`  3. Run conformance tests: pnpm test --filter @ripple-next/${packageName}`)
  } else {
    console.log(`  3. Add tests: packages/${packageName}/tests/${providerName}.provider.test.ts`)
  }
  console.log(`  4. Export from: packages/${packageName}/index.ts`)
  console.log(`  5. Run: pnpm test && pnpm typecheck`)
}

// CLI entrypoint
if (process.argv[1]?.endsWith('provider.mjs')) {
  const { positional, flags } = parseArgs(process.argv)
  const [packageName, providerName] = positional
  const dryRun = flags.has('--dry-run')

  if (!packageName || !providerName) {
    console.error('Usage: pnpm generate:provider <package> <name> [--dry-run]')
    process.exit(1)
  }

  generateProvider(packageName, providerName, { dryRun })
}
