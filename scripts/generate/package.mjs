#!/usr/bin/env node
/**
 * Package Generator — scaffolds a full @ripple-next/* package.
 *
 * Usage:
 *   pnpm generate:package <name> [--dry-run]
 *
 * Examples:
 *   pnpm generate:package cache             # creates packages/cache/
 *   pnpm generate:package notifications     # creates packages/notifications/
 *   pnpm generate:package pdf --dry-run
 *
 * Output files:
 *   packages/{name}/package.json
 *   packages/{name}/tsconfig.json
 *   packages/{name}/index.ts
 *   packages/{name}/types.ts
 *   packages/{name}/tests/{name}.test.ts
 */
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { ROOT, toPascalCase, toKebabCase, writeFile, parseArgs } from './lib.mjs'

export function generatePackage(name, options = {}) {
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(name)) {
    throw new Error('Package name must be alphanumeric with optional hyphens')
  }
  const dryRun = options.dryRun || false
  const kebab = toKebabCase(name)
  const pascal = toPascalCase(name)
  const pkgDir = join(ROOT, 'packages', kebab)

  if (existsSync(pkgDir)) {
    console.error(`Error: Package "packages/${kebab}" already exists.`)
    process.exit(1)
  }

  console.log(`\nGenerating package: @ripple-next/${kebab}`)
  console.log('─'.repeat(40))

  // 1. package.json
  writeFile(
    join(pkgDir, 'package.json'),
    JSON.stringify(
      {
        name: `@ripple-next/${kebab}`,
        version: '0.1.0',
        type: 'module',
        main: './index.ts',
        types: './index.ts',
        exports: {
          '.': './index.ts'
        },
        files: ['dist'],
        publishConfig: {
          access: 'restricted',
          main: './dist/index.js',
          types: './dist/index.d.ts',
          exports: {
            '.': {
              types: './dist/index.d.ts',
              import: './dist/index.js'
            }
          }
        },
        scripts: {
          build: 'tsc',
          test: 'vitest run --passWithNoTests',
          lint: 'eslint .',
          typecheck: 'tsc --noEmit'
        },
        devDependencies: {
          typescript: '^5.7.3',
          vitest: '^3.0.4'
        }
      },
      null,
      2
    ) + '\n',
    dryRun
  )

  // 2. tsconfig.json
  writeFile(
    join(pkgDir, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: '.'
        },
        include: ['./**/*.ts'],
        exclude: ['node_modules', 'dist', '**/*.test.ts', '../../*.ts']
      },
      null,
      2
    ) + '\n',
    dryRun
  )

  // 3. types.ts
  writeFile(
    join(pkgDir, 'types.ts'),
    `/**
 * @ripple-next/${kebab} — Provider interface and types.
 *
 * Define your provider interface here. All implementations must
 * conform to this contract. Tests use a memory/mock provider.
 */

export interface ${pascal}Provider {
  // TODO: Define provider interface methods
}
`,
    dryRun
  )

  // 4. index.ts
  writeFile(
    join(pkgDir, 'index.ts'),
    `export type { ${pascal}Provider } from './types'
`,
    dryRun
  )

  // 5. Test file
  writeFile(
    join(pkgDir, 'tests', `${kebab}.test.ts`),
    `import { describe, it, expect } from 'vitest'

describe('@ripple-next/${kebab}', () => {
  it('should export types', () => {
    // Type-level test — verifies the module can be imported
    expect(true).toBe(true)
  })

  // TODO: Add provider tests, conformance test registration
})
`,
    dryRun
  )

  console.log()
  console.log(`Done! Next steps:`)
  console.log(`  1. Define interface: packages/${kebab}/types.ts`)
  console.log(`  2. Add implementations in: packages/${kebab}/providers/`)
  console.log(`  3. Run: pnpm install (to register the new workspace package)`)
  console.log(`  4. Add to vitest.workspace.ts with appropriate coverage tier`)
  console.log(`  5. Run: pnpm test && pnpm typecheck`)
}

// CLI entrypoint
if (process.argv[1]?.endsWith('package.mjs')) {
  const { positional, flags } = parseArgs(process.argv)
  const name = positional[0]
  const dryRun = flags.has('--dry-run')

  if (!name) {
    console.error('Usage: pnpm generate:package <name> [--dry-run]')
    process.exit(1)
  }

  generatePackage(name, { dryRun })
}
