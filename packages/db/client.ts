import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type Database = ReturnType<typeof createDatabase>

export function createDatabase(connectionString: string): ReturnType<typeof drizzle> {
  const client = postgres(connectionString)
  return drizzle(client, { schema })
}

// Factory for different environments:
// - Local dev: DATABASE_URL from docker-compose
// - Test: testcontainers connection string
// - Production: SST Resource connection string
let db: Database | null = null

export function getDatabase(connectionString?: string): Database {
  if (!db) {
    const url = connectionString ?? process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is required')
    }
    db = createDatabase(url)
  }
  return db
}
