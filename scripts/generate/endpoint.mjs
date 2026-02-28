#!/usr/bin/env node
/**
 * Endpoint Generator — scaffolds a tRPC router with validation schema and test.
 *
 * Usage:
 *   pnpm generate:endpoint <router> <procedure> [--dry-run]
 *
 * Examples:
 *   pnpm generate:endpoint project getById        # adds to project router
 *   pnpm generate:endpoint notification list       # creates notification router
 *   pnpm generate:endpoint audit log --dry-run
 *
 * Output files:
 *   apps/web/server/trpc/routers/{router}.ts (created or appended)
 *   apps/web/tests/unit/trpc/{router}-router.test.ts (created if new)
 */
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { ROOT, toPascalCase, toCamelCase, writeFile, parseArgs } from './lib.mjs'

export function generateEndpoint(routerName, procedureName, options = {}) {
  const dryRun = options.dryRun || false
  const camelRouter = toCamelCase(routerName)
  const routerFile = join(ROOT, 'apps/web/server/trpc/routers', `${routerName}.ts`)
  const indexFile = join(ROOT, 'apps/web/server/trpc/routers/index.ts')
  const testFile = join(ROOT, 'apps/web/tests/unit/trpc', `${routerName}-router.test.ts`)

  const isNewRouter = !existsSync(routerFile)

  console.log(`\nGenerating endpoint: ${camelRouter}.${procedureName}`)
  console.log('─'.repeat(40))

  if (isNewRouter) {
    // Create new router file
    writeFile(
      routerFile,
      `import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const ${camelRouter}Router = router({
  ${procedureName}: protectedProcedure
    .input(
      z.object({
        // TODO: Define input schema
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Implement procedure
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Not implemented' })
    }),
})
`,
      dryRun
    )

    // Register in index.ts
    if (!dryRun && existsSync(indexFile)) {
      const indexContent = readFileSync(indexFile, 'utf-8')
      if (!indexContent.includes(`${camelRouter}Router`)) {
        // Add import and registration
        const newImport = `import { ${camelRouter}Router } from './${routerName}'`
        const updated = indexContent
          .replace(
            /(import { router } from '\.\.\/trpc')/,
            `$1\n${newImport}`
          )
          .replace(
            /router\(\{/,
            `router({\n  ${routerName}: ${camelRouter}Router,`
          )
        writeFileSync(indexFile, updated)
        console.log(`  Updated: apps/web/server/trpc/routers/index.ts`)
      }
    } else if (dryRun) {
      console.log(`  [dry-run] Would update: apps/web/server/trpc/routers/index.ts`)
    }

    // Create test file
    writeFile(
      testFile,
      `import { describe, it, expect, vi } from 'vitest'

describe('${camelRouter}Router', () => {
  describe('${procedureName}', () => {
    it('should require authentication', async () => {
      // TODO: Test that unauthenticated calls are rejected
      expect(true).toBe(true)
    })

    it('should validate input', async () => {
      // TODO: Test input validation
      expect(true).toBe(true)
    })

    // TODO: Add procedure-specific tests
  })
})
`,
      dryRun
    )
  } else {
    console.log(`  Router already exists: apps/web/server/trpc/routers/${routerName}.ts`)
    console.log(`  Add the "${procedureName}" procedure manually to the existing router.`)
    console.log()
    console.log(`  Suggested code:`)
    console.log()
    console.log(`    ${procedureName}: protectedProcedure`)
    console.log(`      .input(z.object({ /* TODO */ }))`)
    console.log(`      .query(async ({ ctx, input }) => {`)
    console.log(`        // TODO: Implement`)
    console.log(`      }),`)
  }

  console.log()
  console.log(`Done! Next steps:`)
  if (isNewRouter) {
    console.log(`  1. Implement: apps/web/server/trpc/routers/${routerName}.ts`)
    console.log(`  2. Add validation schemas (Zod)`)
    console.log(`  3. Write tests: apps/web/tests/unit/trpc/${routerName}-router.test.ts`)
  } else {
    console.log(`  1. Add the procedure to the existing router`)
    console.log(`  2. Add tests for the new procedure`)
  }
  console.log(`  4. Run: pnpm test && pnpm typecheck`)
}

// CLI entrypoint
if (process.argv[1]?.endsWith('endpoint.mjs')) {
  const { positional, flags } = parseArgs(process.argv)
  const [routerName, procedureName] = positional
  const dryRun = flags.has('--dry-run')

  if (!routerName || !procedureName) {
    console.error('Usage: pnpm generate:endpoint <router> <procedure> [--dry-run]')
    process.exit(1)
  }

  generateEndpoint(routerName, procedureName, { dryRun })
}
