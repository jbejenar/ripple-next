import { existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDatabase } from './client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }

  const migrationsFolder = resolve(__dirname, './migrations')
  const hasMigrations =
    existsSync(migrationsFolder) && readdirSync(migrationsFolder).some((f) => f.endsWith('.sql'))

  if (!hasMigrations) {
    console.log('No migration files found, skipping.')
    process.exit(0)
  }

  const db = createDatabase(connectionString)
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder })
  console.log('Migrations complete.')
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
