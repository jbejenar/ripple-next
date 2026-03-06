import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import type { TestDb } from '@ripple-next/testing/helpers/db'
import { setupTestDb, teardownTestDb, isDockerAvailable } from '@ripple-next/testing/helpers/db'
import { SessionRepository } from '../../repositories/session.repository'
import * as schema from '../../schema'

const dockerAvailable = isDockerAvailable()

describe.runIf(dockerAvailable)('SessionRepository (Testcontainers Integration)', () => {
  let testDb: TestDb
  let repo: SessionRepository

  beforeAll(async () => {
    testDb = await setupTestDb()

    // Create the users table first (sessions references users)
    await testDb.client.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        oidc_sub VARCHAR(255) UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Create the sessions table
    await testDb.client.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Insert a test user for session foreign keys
    await testDb.client.execute(sql`
      INSERT INTO users (id, email, name) VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'testuser@example.com', 'Test User'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'otheruser@example.com', 'Other User')
    `)
  }, 60_000)

  afterAll(async () => {
    await teardownTestDb(testDb)
  }, 30_000)

  beforeEach(async () => {
    await testDb.client.delete(schema.sessions)
    repo = new SessionRepository(testDb.client)
  })

  const testUserId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  const otherUserId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  const futureDate = new Date(Date.now() + 3600_000) // 1 hour from now
  const pastDate = new Date(Date.now() - 3600_000) // 1 hour ago

  it('creates a session and returns it', async () => {
    const session = await repo.create({
      userId: testUserId,
      token: 'session-token-1',
      expiresAt: futureDate,
    })

    expect(session.id).toBeTruthy()
    expect(session.userId).toBe(testUserId)
    expect(session.token).toBe('session-token-1')
    expect(session.expiresAt).toBeInstanceOf(Date)
  })

  it('findByToken returns the created session', async () => {
    await repo.create({
      userId: testUserId,
      token: 'find-token',
      expiresAt: futureDate,
    })

    const found = await repo.findByToken('find-token')

    expect(found).toBeDefined()
    expect(found!.token).toBe('find-token')
    expect(found!.userId).toBe(testUserId)
  })

  it('findByToken returns undefined for non-existent token', async () => {
    const found = await repo.findByToken('nonexistent-token')

    expect(found).toBeUndefined()
  })

  it('deleteByToken removes the session', async () => {
    await repo.create({
      userId: testUserId,
      token: 'delete-me',
      expiresAt: futureDate,
    })

    await repo.deleteByToken('delete-me')
    const found = await repo.findByToken('delete-me')

    expect(found).toBeUndefined()
  })

  it('deleteExpired removes only expired sessions', async () => {
    await repo.create({
      userId: testUserId,
      token: 'expired-session',
      expiresAt: pastDate,
    })
    await repo.create({
      userId: testUserId,
      token: 'valid-session',
      expiresAt: futureDate,
    })

    await repo.deleteExpired()

    const expired = await repo.findByToken('expired-session')
    const valid = await repo.findByToken('valid-session')

    expect(expired).toBeUndefined()
    expect(valid).toBeDefined()
  })

  it('deleteByUserId removes all sessions for that user', async () => {
    await repo.create({
      userId: testUserId,
      token: 'user-session-1',
      expiresAt: futureDate,
    })
    await repo.create({
      userId: testUserId,
      token: 'user-session-2',
      expiresAt: futureDate,
    })
    await repo.create({
      userId: otherUserId,
      token: 'other-user-session',
      expiresAt: futureDate,
    })

    await repo.deleteByUserId(testUserId)

    const s1 = await repo.findByToken('user-session-1')
    const s2 = await repo.findByToken('user-session-2')
    const other = await repo.findByToken('other-user-session')

    expect(s1).toBeUndefined()
    expect(s2).toBeUndefined()
    expect(other).toBeDefined()
  })

  it('enforces unique token constraint', async () => {
    await repo.create({
      userId: testUserId,
      token: 'unique-token',
      expiresAt: futureDate,
    })

    await expect(
      repo.create({
        userId: testUserId,
        token: 'unique-token',
        expiresAt: futureDate,
      })
    ).rejects.toThrow()
  })
})
