import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import type { TestDb } from '@ripple-next/testing/helpers/db'
import { setupTestDb, teardownTestDb, isDockerAvailable } from '@ripple-next/testing/helpers/db'
import { UserRepository } from '../../repositories/user.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import * as schema from '../../schema'

const dockerAvailable = isDockerAvailable()

describe.runIf(dockerAvailable)('ProjectRepository (Testcontainers Integration)', () => {
  let testDb: TestDb
  let userRepo: UserRepository
  let projectRepo: ProjectRepository
  let ownerId: string

  beforeAll(async () => {
    testDb = await setupTestDb()

    // Create tables in the test database
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

    await testDb.client.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) NOT NULL UNIQUE,
        owner_id UUID NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Create an owner user for projects
    userRepo = new UserRepository(testDb.client)
    const owner = await userRepo.create({
      email: 'owner@example.com',
      name: 'Project Owner'
    })
    ownerId = owner.id
  }, 60_000)

  afterAll(async () => {
    await teardownTestDb(testDb)
  }, 30_000)

  beforeEach(async () => {
    await testDb.client.delete(schema.projects)
    projectRepo = new ProjectRepository(testDb.client)
  })

  it('creates a project and returns it', async () => {
    const project = await projectRepo.create({
      name: 'My Project',
      slug: 'my-project',
      ownerId
    })
    expect(project.id).toBeTruthy()
    expect(project.name).toBe('My Project')
    expect(project.slug).toBe('my-project')
    expect(project.status).toBe('draft')
  })

  it('findById returns the created project', async () => {
    const created = await projectRepo.create({
      name: 'Find Me',
      slug: 'find-me',
      ownerId
    })
    const found = await projectRepo.findById(created.id)
    expect(found).toBeDefined()
    expect(found!.name).toBe('Find Me')
  })

  it('findById returns undefined for non-existent id', async () => {
    const found = await projectRepo.findById('00000000-0000-0000-0000-000000000000')
    expect(found).toBeUndefined()
  })

  it('findBySlug returns project', async () => {
    await projectRepo.create({
      name: 'Slugged Project',
      slug: 'slugged-project',
      ownerId
    })
    const found = await projectRepo.findBySlug('slugged-project')
    expect(found).toBeDefined()
    expect(found!.name).toBe('Slugged Project')
  })

  it('listByOwner returns owner projects', async () => {
    await projectRepo.create({ name: 'Project A', slug: 'project-a', ownerId })
    await projectRepo.create({ name: 'Project B', slug: 'project-b', ownerId })
    const projects = await projectRepo.listByOwner(ownerId)
    expect(projects).toHaveLength(2)
  })

  it('update modifies project fields', async () => {
    const created = await projectRepo.create({
      name: 'Original',
      slug: 'original',
      ownerId
    })
    const updated = await projectRepo.update(created.id, { name: 'Updated' })
    expect(updated.name).toBe('Updated')
  })

  it('delete removes project', async () => {
    const created = await projectRepo.create({
      name: 'To Delete',
      slug: 'to-delete',
      ownerId
    })
    await projectRepo.delete(created.id)
    const found = await projectRepo.findById(created.id)
    expect(found).toBeUndefined()
  })

  it('enforces unique slug constraint', async () => {
    await projectRepo.create({
      name: 'First',
      slug: 'unique-slug',
      ownerId
    })
    await expect(
      projectRepo.create({ name: 'Second', slug: 'unique-slug', ownerId })
    ).rejects.toThrow()
  })
})
