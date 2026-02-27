import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import type { TestDb } from '@ripple/testing/helpers/db'
import { setupTestDb, teardownTestDb, isDockerAvailable } from '@ripple/testing/helpers/db'
import { UserRepository } from '../../repositories/user.repository'
import * as schema from '../../schema'

const dockerAvailable = isDockerAvailable()

describe.runIf(dockerAvailable)('UserRepository (Testcontainers Integration)', () => {
  let testDb: TestDb
  let repo: UserRepository

  beforeAll(async () => {
    testDb = await setupTestDb()

    // Create the users table in the test database
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
  }, 60_000) // 60s timeout for container startup

  afterAll(async () => {
    await teardownTestDb(testDb)
  }, 30_000)

  beforeEach(async () => {
    await testDb.client.delete(schema.users)
    repo = new UserRepository(testDb.client)
  })

  it('creates a user and returns it', async () => {
    const user = await repo.create({
      email: 'alice@example.com',
      name: 'Alice'
    })
    expect(user.id).toBeTruthy()
    expect(user.email).toBe('alice@example.com')
    expect(user.name).toBe('Alice')
    expect(user.role).toBe('user')
    expect(user.isActive).toBe(true)
  })

  it('findById returns the created user', async () => {
    const created = await repo.create({
      email: 'bob@example.com',
      name: 'Bob'
    })
    const found = await repo.findById(created.id)
    expect(found).toBeDefined()
    expect(found!.email).toBe('bob@example.com')
  })

  it('findById returns undefined for non-existent id', async () => {
    const found = await repo.findById('00000000-0000-0000-0000-000000000000')
    expect(found).toBeUndefined()
  })

  it('findByEmail returns user', async () => {
    await repo.create({
      email: 'carol@example.com',
      name: 'Carol'
    })
    const found = await repo.findByEmail('carol@example.com')
    expect(found).toBeDefined()
    expect(found!.name).toBe('Carol')
  })

  it('findByEmail returns undefined for unknown email', async () => {
    const found = await repo.findByEmail('nobody@example.com')
    expect(found).toBeUndefined()
  })

  it('list returns all users', async () => {
    await repo.create({ email: 'a@example.com', name: 'A' })
    await repo.create({ email: 'b@example.com', name: 'B' })
    const users = await repo.list()
    expect(users).toHaveLength(2)
  })

  it('update modifies user fields', async () => {
    const created = await repo.create({
      email: 'dave@example.com',
      name: 'Dave'
    })
    const updated = await repo.update(created.id, { name: 'David' })
    expect(updated.name).toBe('David')
    expect(updated.email).toBe('dave@example.com')
  })

  it('findByOidcSub returns user with matching oidc_sub', async () => {
    await repo.create({
      email: 'eve@example.com',
      name: 'Eve',
      oidcSub: 'auth0|12345'
    })
    const found = await repo.findByOidcSub('auth0|12345')
    expect(found).toBeDefined()
    expect(found!.email).toBe('eve@example.com')
  })

  it('delete removes user', async () => {
    const created = await repo.create({
      email: 'frank@example.com',
      name: 'Frank'
    })
    await repo.delete(created.id)
    const found = await repo.findById(created.id)
    expect(found).toBeUndefined()
  })

  it('enforces unique email constraint', async () => {
    await repo.create({
      email: 'unique@example.com',
      name: 'First'
    })
    await expect(
      repo.create({ email: 'unique@example.com', name: 'Second' })
    ).rejects.toThrow()
  })
})
