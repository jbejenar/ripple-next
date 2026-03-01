#!/usr/bin/env node
/**
 * Endpoint Generator — scaffolds an oRPC procedure with validation schema and test.
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
 *   apps/web/server/orpc/routers/{router}.ts (created or appended)
 *   apps/web/tests/unit/orpc/{router}-router.test.ts (created if new)
 *
 * After RN-046: emits oRPC boilerplate (previously tRPC).
 */
import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { ROOT, toCamelCase, writeFile, parseArgs } from './lib.mjs'

export function generateEndpoint(routerName, procedureName, options = {}) {
  // Validate names contain only safe characters (alphanumeric, hyphens)
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(routerName) || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(procedureName)) {
    throw new Error('Router and procedure names must be alphanumeric (hyphens allowed in router name)')
  }
  const dryRun = options.dryRun || false
  const camelRouter = toCamelCase(routerName)
  const routerFile = join(ROOT, 'apps/web/server/orpc/routers', `${routerName}.ts`)
  const routerIndexFile = join(ROOT, 'apps/web/server/orpc/router.ts')
  const testFile = join(ROOT, 'apps/web/tests/unit/orpc', `${routerName}-router.test.ts`)

  // Check if router already exists (try read instead of existsSync to avoid TOCTOU)
  let isNewRouter = true
  try {
    readFileSync(routerFile, 'utf-8')
    isNewRouter = false
  } catch {
    // File does not exist — will create it
  }

  console.log(`\nGenerating endpoint: ${camelRouter}.${procedureName}`)
  console.log('─'.repeat(40))

  if (isNewRouter) {
    // Create new oRPC router file
    writeFile(
      routerFile,
      `import { z } from 'zod'
import { ORPCError } from '@orpc/server'
import { protectedProcedure } from '../base'

export const ${procedureName} = protectedProcedure
  .route({ method: 'GET', path: '/v1/${routerName}s', tags: ['${routerName}s'] })
  .meta({ visibility: 'internal' })
  .input(
    z.object({
      // TODO: Define input schema
    })
  )
  .handler(async ({ context, input }) => {
    // TODO: Implement procedure
    throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Not implemented' })
  })
`,
      dryRun
    )

    // Register in router.ts
    if (!dryRun) {
      let indexContent
      try {
        indexContent = readFileSync(routerIndexFile, 'utf-8')
      } catch {
        indexContent = null
      }
      if (indexContent && !indexContent.includes(`* as ${camelRouter}Router`)) {
        const importLine = `import * as ${camelRouter}Router from './routers/${routerName}'`
        const updated = indexContent
          .replace(
            /(import \{ healthCheck \}.*\n)/,
            `$1${importLine}\n`
          )
          .replace(
            /export const appRouter = \{/,
            `export const appRouter = {\n  ${routerName}: {\n    ${procedureName}: ${camelRouter}Router.${procedureName}\n  },`
          )
        writeFileSync(routerIndexFile, updated)
        console.log(`  Updated: apps/web/server/orpc/router.ts`)
      }
    } else {
      console.log(`  [dry-run] Would update: apps/web/server/orpc/router.ts`)
    }

    // Create test file
    writeFile(
      testFile,
      `import { describe, it, expect, vi } from 'vitest'
import { ORPCError, createRouterClient } from '@orpc/server'
import { appRouter } from '../../../server/orpc/router'
import type { Context } from '../../../server/orpc/context'

function makeUnauthenticatedContext(): Context {
  return {
    event: {} as Context['event'],
    session: null,
    db: undefined
  }
}

describe('${camelRouter}.${procedureName}', () => {
  it('should require authentication', async () => {
    const client = createRouterClient(appRouter, {
      context: makeUnauthenticatedContext()
    })
    await expect(client.${routerName}.${procedureName}({})).rejects.toThrow(ORPCError)
    await expect(client.${routerName}.${procedureName}({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('should validate input', async () => {
    // TODO: Test input validation with authenticated context
    expect(true).toBe(true)
  })

  // TODO: Add procedure-specific tests
})
`,
      dryRun
    )
  } else {
    console.log(`  Router already exists: apps/web/server/orpc/routers/${routerName}.ts`)
    console.log(`  Add the "${procedureName}" procedure manually to the existing router.`)
    console.log()
    console.log(`  Suggested code:`)
    console.log()
    console.log(`    export const ${procedureName} = protectedProcedure`)
    console.log(`      .route({ method: 'GET', path: '/v1/${routerName}s/${procedureName}', tags: ['${routerName}s'] })`)
    console.log(`      .meta({ visibility: 'internal' })`)
    console.log(`      .input(z.object({ /* TODO */ }))`)
    console.log(`      .handler(async ({ context, input }) => {`)
    console.log(`        // TODO: Implement`)
    console.log(`      })`)
  }

  console.log()
  console.log(`Done! Next steps:`)
  if (isNewRouter) {
    console.log(`  1. Implement: apps/web/server/orpc/routers/${routerName}.ts`)
    console.log(`  2. Add validation schemas (Zod)`)
    console.log(`  3. Write tests: apps/web/tests/unit/orpc/${routerName}-router.test.ts`)
    console.log(`  4. Register procedures in apps/web/server/orpc/router.ts`)
  } else {
    console.log(`  1. Add the procedure to the existing router`)
    console.log(`  2. Register in apps/web/server/orpc/router.ts`)
    console.log(`  3. Add tests for the new procedure`)
  }
  console.log(`  5. Run: pnpm test && pnpm typecheck`)
  console.log(`  6. Run: pnpm generate:openapi (to update OpenAPI spec)`)
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
