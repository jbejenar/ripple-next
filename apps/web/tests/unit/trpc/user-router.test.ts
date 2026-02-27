/**
 * Contract tests for the user tRPC router.
 *
 * These tests verify the API contract (input validation, auth enforcement,
 * error codes) using a mock database layer. They do NOT hit a real DB —
 * that's the integration test layer's job.
 */
import { describe, it, expect, vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import { appRouter } from '../../../server/trpc/routers/index'
import type { Context, Session } from '../../../server/trpc/context'

// ── Helpers ──────────────────────────────────────────────────────────
function makeContext(overrides: Partial<Context> = {}): Context {
  const authenticatedSession: Session = {
    user: { id: 'user-1', email: 'test@example.com', role: 'admin' }
  }

  return {
    event: {} as Context['event'],
    session: authenticatedSession,
    db: makeMockDb(),
    ...overrides
  }
}

function makeUnauthenticatedContext(): Context {
  return {
    event: {} as Context['event'],
    session: null,
    db: makeMockDb()
  }
}

/**
 * Minimal mock DB that satisfies the UserRepository constructor.
 * We mock at the drizzle query level since the repository calls db.insert/select/etc.
 */
function makeMockDb(): Context['db'] {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      isActive: true,
      passwordHash: null,
      oidcSub: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user-2',
      email: 'other@example.com',
      name: 'Other User',
      role: 'user',
      isActive: true,
      passwordHash: null,
      oidcSub: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // This mock supports the Drizzle query builder chain pattern
  const createChain = (result: unknown): Record<string, unknown> => {
    const chain: Record<string, unknown> = {}
    chain.from = vi.fn().mockReturnValue(chain)
    chain.where = vi.fn().mockImplementation((_condition: unknown) => {
      return { ...chain, then: (resolve: (value: unknown) => void) => resolve(result) }
    })
    chain.values = vi.fn().mockReturnValue(chain)
    chain.returning = vi.fn().mockReturnValue(chain)
    chain.set = vi.fn().mockReturnValue(chain)
    chain.then = (resolve: (value: unknown) => void) => resolve(result)
    return chain
  }

  return {
    select: vi.fn().mockImplementation(() => createChain(mockUsers)),
    insert: vi.fn().mockImplementation(() =>
      createChain([
        {
          id: 'new-user-id',
          email: 'new@example.com',
          name: 'New User',
          role: 'user',
          isActive: true,
          passwordHash: null,
          oidcSub: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    ),
    update: vi.fn().mockImplementation(() => createChain(mockUsers)),
    delete: vi.fn().mockImplementation(() => createChain([]))
  } as unknown as Context['db']
}

// ── Tests ────────────────────────────────────────────────────────────

describe('user.me', () => {
  it('returns the authenticated user from session', async () => {
    const caller = appRouter.createCaller(makeContext())
    const result = await caller.user.me()
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      role: 'admin'
    })
  })

  it('throws UNAUTHORIZED when not authenticated', async () => {
    const caller = appRouter.createCaller(makeUnauthenticatedContext())
    await expect(caller.user.me()).rejects.toThrow(TRPCError)
    await expect(caller.user.me()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('user.getById', () => {
  it('requires a valid UUID input', async () => {
    const caller = appRouter.createCaller(makeContext())
    await expect(caller.user.getById({ id: 'not-a-uuid' })).rejects.toThrow()
  })

  it('throws UNAUTHORIZED when not authenticated', async () => {
    const caller = appRouter.createCaller(makeUnauthenticatedContext())
    await expect(
      caller.user.getById({ id: '550e8400-e29b-41d4-a716-446655440000' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('user.create', () => {
  it('validates email format', async () => {
    const caller = appRouter.createCaller(makeContext())
    await expect(
      caller.user.create({ email: 'not-an-email', name: 'Test' })
    ).rejects.toThrow()
  })

  it('validates name is not empty', async () => {
    const caller = appRouter.createCaller(makeContext())
    await expect(
      caller.user.create({ email: 'valid@example.com', name: '' })
    ).rejects.toThrow()
  })

  it('throws UNAUTHORIZED when not authenticated', async () => {
    const caller = appRouter.createCaller(makeUnauthenticatedContext())
    await expect(
      caller.user.create({ email: 'new@example.com', name: 'New User' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('user.list', () => {
  it('throws UNAUTHORIZED when not authenticated', async () => {
    const caller = appRouter.createCaller(makeUnauthenticatedContext())
    await expect(caller.user.list()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('API contract: all protected procedures require auth', () => {
  const protectedEndpoints = [
    { name: 'user.me', call: (c: ReturnType<typeof appRouter.createCaller>) => c.user.me() },
    {
      name: 'user.getById',
      call: (c: ReturnType<typeof appRouter.createCaller>) =>
        c.user.getById({ id: '550e8400-e29b-41d4-a716-446655440000' })
    },
    {
      name: 'user.create',
      call: (c: ReturnType<typeof appRouter.createCaller>) =>
        c.user.create({ email: 'test@test.com', name: 'Test' })
    },
    { name: 'user.list', call: (c: ReturnType<typeof appRouter.createCaller>) => c.user.list() }
  ]

  for (const endpoint of protectedEndpoints) {
    it(`${endpoint.name} rejects unauthenticated requests`, async () => {
      const caller = appRouter.createCaller(makeUnauthenticatedContext())
      try {
        await endpoint.call(caller)
        expect.fail(`${endpoint.name} should have thrown UNAUTHORIZED`)
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError)
        expect((e as TRPCError).code).toBe('UNAUTHORIZED')
      }
    })
  }
})
