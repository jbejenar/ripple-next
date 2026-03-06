import { defineCommand } from 'citty'
import { resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import type { MigrationEntry } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import {
  resolveRoot,
  success,
  failure,
  runCommand,
  commandExists,
  outputResult,
  commandNotFoundResult,
} from '../utils.js'

export const dbStatusCommand = defineCommand({
  meta: {
    name: 'status',
    description: 'Database migration status (wraps drizzle-kit status)',
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Output as JSON CommandResult',
      default: false,
    },
    verbose: {
      type: 'boolean',
      description: 'Show detailed output',
      default: false,
    },
  },
  run({ args }) {
    const startTime = Date.now()
    const root = resolveRoot()

    // Check if drizzle-kit is available via npx
    const drizzleKitPath = resolve(root, 'node_modules/.bin/drizzle-kit')
    const hasDrizzleKit = existsSync(drizzleKitPath) || commandExists('drizzle-kit')

    if (!hasDrizzleKit) {
      const result = commandNotFoundResult('db status', 'drizzle-kit', startTime)
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    // Try to find migration files to report on
    const migrationsDir = resolve(root, 'packages/db/drizzle')
    const migrations: MigrationEntry[] = []

    if (existsSync(migrationsDir)) {
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()

      for (const file of files) {
        migrations.push({
          name: file,
          status: 'applied', // Default assumption; drizzle-kit status would tell us accurately
        })
      }
    }

    // Run drizzle-kit status for accurate info
    const { stdout, stderr, exitCode } = runCommand(
      'pnpm',
      ['--filter', '@ripple-next/db', 'exec', 'drizzle-kit', 'status'],
      root
    )

    if (exitCode !== 0) {
      // If drizzle-kit status fails (e.g., no DB connection), report what we can
      const result = failure(
        'db status',
        CLI_ERROR_CODES.EXECUTION_FAILED,
        `drizzle-kit status failed: ${stderr || stdout}`.trim(),
        startTime,
        'Ensure DATABASE_URL is set and the database is reachable.'
      )
      result.data = {
        migrationFiles: migrations,
        drizzleOutput: (stdout + stderr).trim(),
      }
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    // Parse drizzle-kit status output for pending migrations
    const pending = parsePendingMigrations(stdout, migrations)

    const result = success(
      'db status',
      {
        migrations: pending,
        totalFiles: migrations.length,
        pendingCount: pending.filter((m) => m.status === 'pending').length,
        appliedCount: pending.filter((m) => m.status === 'applied').length,
        drizzleOutput: args.verbose ? stdout.trim() : undefined,
      },
      startTime
    )

    outputResult(result, args)

    if (!args.json) {
      const pendingMigrations = pending.filter((m) => m.status === 'pending')
      if (pendingMigrations.length === 0) {
        process.stdout.write('  All migrations applied.\n')
      } else {
        process.stdout.write(`  ${pendingMigrations.length} pending migration(s):\n`)
        for (const m of pendingMigrations) {
          process.stdout.write(`    - ${m.name}\n`)
        }
      }
    }
  },
})

function parsePendingMigrations(
  output: string,
  fileMigrations: MigrationEntry[]
): MigrationEntry[] {
  // drizzle-kit status outputs information about pending migrations
  // If the output mentions "pending" or "not applied", mark those
  const lowerOutput = output.toLowerCase()

  if (lowerOutput.includes('no pending') || lowerOutput.includes('everything is up to date')) {
    return fileMigrations.map((m) => ({ ...m, status: 'applied' as const }))
  }

  // Try to detect pending migration names from output
  return fileMigrations.map((m) => {
    const isPending =
      lowerOutput.includes(m.name.toLowerCase()) && lowerOutput.includes('pending')
    return { ...m, status: isPending ? ('pending' as const) : ('applied' as const) }
  })
}
