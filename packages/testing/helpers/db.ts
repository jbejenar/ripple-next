import type { Database } from '@ripple/db'

export interface TestDb {
  client: Database
  connectionString: string
  cleanup: () => Promise<void>
}

/**
 * Set up a test database using Testcontainers.
 * Spins up a real PostgreSQL container for integration tests.
 */
export async function setupTestDb(): Promise<TestDb> {
  const { PostgreSqlContainer } = await import('@testcontainers/postgresql')
  const { createDatabase } = await import('@ripple/db')

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
