import { execSync } from 'node:child_process'
import type { Database } from '@ripple-next/db'

export interface TestDb {
  client: Database
  connectionString: string
  cleanup: () => Promise<void>
}

/**
 * Check if Docker is available in the current environment.
 * Returns true if `docker info` succeeds, false otherwise.
 */
export function isDockerAvailable(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Set up a test database using Testcontainers.
 * Spins up a real PostgreSQL container for integration tests.
 */
export async function setupTestDb(): Promise<TestDb> {
  const { PostgreSqlContainer } = await import('@testcontainers/postgresql')
  const { createDatabase } = await import('@ripple-next/db')

  const container = await new PostgreSqlContainer('postgres:17-alpine').start()
  const connectionString = container.getConnectionUri()
  const client = createDatabase(connectionString)

  return {
    client,
    connectionString,
    cleanup: async () => {
      await container.stop()
    }
  }
}

/**
 * Tear down a test database.
 */
export async function teardownTestDb(testDb: TestDb): Promise<void> {
  await testDb.cleanup()
}
