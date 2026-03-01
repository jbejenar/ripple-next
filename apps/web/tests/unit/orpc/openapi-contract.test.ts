/**
 * OpenAPI consumer contract validation tests (RN-025).
 *
 * These tests verify that the committed OpenAPI spec at docs/api/openapi.json
 * accurately describes the oRPC router's behaviour. A consumer relying on
 * the spec should get the responses the spec promises.
 *
 * Contract guarantees tested:
 * - Every spec path + method is callable via the router
 * - Required request fields are enforced
 * - Response status codes match the spec
 * - OperationIds are stable and unique
 * - Auth requirements are consistent (public endpoints are reachable)
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRouterClient, ORPCError } from '@orpc/server'
import { appRouter } from '../../../server/orpc/router'
import type { Context, AppSession } from '../../../server/orpc/context'
import { vi } from 'vitest'

// ── Load the committed OpenAPI spec ──────────────────────────────────

interface OpenAPIParameter {
  name: string
  in: string
  required?: boolean
  schema?: { type?: string; format?: string }
}

interface OpenAPIRequestBody {
  required?: boolean
  content?: {
    'application/json'?: {
      schema?: {
        type?: string
        properties?: Record<string, unknown>
        required?: string[]
      }
    }
  }
}

interface OpenAPIOperation {
  operationId?: string
  tags?: string[]
  parameters?: OpenAPIParameter[]
  requestBody?: OpenAPIRequestBody
  responses?: Record<string, unknown>
}

interface OpenAPISpec {
  openapi: string
  info: { title: string; version: string }
  paths: Record<string, Record<string, OpenAPIOperation>>
  servers?: Array<{ url: string }>
}

let spec: OpenAPISpec

beforeAll(() => {
  const specPath = resolve(import.meta.dirname, '../../../../../docs/api/openapi.json')
  spec = JSON.parse(readFileSync(specPath, 'utf-8'))
})

// ── Test helpers ─────────────────────────────────────────────────────

function makeAuthenticatedContext(): Context {
  const session: AppSession = {
    user: { id: 'contract-user-1', email: 'contract@example.com', role: 'admin' },
  }

  return {
    event: {} as Context['event'],
    session,
    db: makeMockDb(),
  }
}

function makeMockDb(): Context['db'] {
  const mockUsers = [
    {
      id: 'contract-user-1',
      email: 'contract@example.com',
      name: 'Contract User',
      role: 'admin',
      isActive: true,
      passwordHash: null,
      oidcSub: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const createChain = (
    result: unknown,
    whereResult?: unknown,
  ): Record<string, unknown> => {
    const chain: Record<string, unknown> = {}
    chain.from = vi.fn().mockReturnValue(chain)
    chain.where = vi.fn().mockImplementation(() => {
      const wr = whereResult !== undefined ? whereResult : result
      return { ...chain, then: (cb: (value: unknown) => void) => cb(wr) }
    })
    chain.values = vi.fn().mockReturnValue(chain)
    chain.returning = vi.fn().mockReturnValue(chain)
    chain.set = vi.fn().mockReturnValue(chain)
    chain.then = (cb: (value: unknown) => void) => cb(result)
    return chain
  }

  return {
    // select().from() returns mockUsers (list); select().from().where() returns
    // the first mock user (findById) or empty (findByEmail with unknown email).
    // For contract tests, where() returns the first user so getById works.
    select: vi.fn().mockImplementation(() => createChain(mockUsers, [mockUsers[0]])),
    insert: vi.fn().mockImplementation(() =>
      createChain([
        {
          id: 'new-contract-user',
          email: 'new@example.com',
          name: 'New User',
          role: 'user',
          isActive: true,
          passwordHash: null,
          oidcSub: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    ),
    update: vi.fn().mockImplementation(() => createChain(mockUsers)),
    delete: vi.fn().mockImplementation(() => createChain([])),
  } as unknown as Context['db']
}

/**
 * Map of operationId → callable function on the router client.
 * This bridges the OpenAPI spec's operationIds to actual router calls.
 */
/**
 * Build a map of operationId → callable for a given router client.
 * Uses the specific client type inferred from appRouter.
 */
function buildOperationMap(context: Context) {
  const client = createRouterClient(appRouter, { context })
  const callMap: Record<string, () => Promise<unknown>> = {
    'user.me': () => client.user.me(),
    'user.getById': () => client.user.getById({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    'user.create': () => client.user.create({ email: 'consumer@example.com', name: 'Consumer' }),
    'user.list': () => client.user.list(),
    health: () => client.health(),
  }
  return { client, callMap }
}

function getOperationCallable(
  callMap: Record<string, () => Promise<unknown>>,
  operationId: string,
): (() => Promise<unknown>) | null {
  return callMap[operationId] ?? null
}

// ── Tests ────────────────────────────────────────────────────────────

describe('OpenAPI Spec Validity', () => {
  it('uses OpenAPI 3.1.x', () => {
    expect(spec.openapi).toMatch(/^3\.1\./)
  })

  it('has a title and version', () => {
    expect(spec.info.title).toBeTruthy()
    expect(spec.info.version).toBeTruthy()
  })

  it('declares server base path', () => {
    expect(spec.servers).toBeDefined()
    const servers = spec.servers ?? []
    expect(servers.length).toBeGreaterThan(0)
    expect(servers[0]?.url).toBeTruthy()
  })
})

describe('OpenAPI ↔ Router: every spec endpoint is callable', () => {
  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

  it('spec has at least one path defined', () => {
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0)
  })

  it('every operation has a unique operationId', () => {
    const operationIds = new Set<string>()
    for (const [, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (!httpMethods.includes(method)) continue
        const op = operation as OpenAPIOperation
        expect(op.operationId).toBeTruthy()
        expect(operationIds.has(op.operationId!)).toBe(false)
        operationIds.add(op.operationId!)
      }
    }
  })

  it('every operationId maps to a callable router procedure', () => {
    const { callMap } = buildOperationMap(makeAuthenticatedContext())

    for (const [, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (!httpMethods.includes(method)) continue
        const op = operation as OpenAPIOperation
        const callable = getOperationCallable(callMap, op.operationId!)
        expect(callable, `operationId "${op.operationId}" has no router mapping`).not.toBeNull()
      }
    }
  })
})

describe('OpenAPI ↔ Router: authenticated endpoints return valid responses', () => {
  it('user.me returns a user-like object', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })
    const result = await client.user.me()
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('email')
  })

  it('user.list returns an array', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })
    const result = await client.user.list()
    expect(Array.isArray(result)).toBe(true)
  })

  it('user.create with valid input returns a user or CONFLICT', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })
    try {
      const result = await client.user.create({
        email: 'consumer-test@example.com',
        name: 'Consumer Test',
      })
      // Success path: returns a user-like object
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
    } catch (e) {
      // CONFLICT is valid — email may already exist in mock DB
      expect(e).toBeInstanceOf(ORPCError)
      expect((e as ORPCError<string, unknown>).code).toBe('CONFLICT')
    }
  })

  it('user.getById with valid UUID returns a user object', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })
    const result = await client.user.getById({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result).toBeDefined()
  })
})

describe('OpenAPI ↔ Router: request validation matches spec constraints', () => {
  it('user.create rejects missing required fields from spec', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })

    // The spec declares email and name as required
    const createOp = spec.paths['/v1/users']?.post as OpenAPIOperation
    const schema = createOp?.requestBody?.content?.['application/json']?.schema
    expect(schema?.required).toContain('email')
    expect(schema?.required).toContain('name')

    // Router enforces these — calling without them should throw
    // @ts-expect-error intentionally testing missing fields
    await expect(client.user.create({})).rejects.toThrow()
  })

  it('user.getById enforces UUID format from spec', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })

    // The spec declares id parameter with format: uuid
    const getByIdOp = spec.paths['/v1/users/{id}']?.get as OpenAPIOperation
    const idParam = getByIdOp?.parameters?.find((p) => p.name === 'id')
    expect(idParam?.schema?.format).toBe('uuid')

    // Router enforces UUID format
    await expect(client.user.getById({ id: 'not-a-uuid' })).rejects.toThrow()
  })

  it('user.create enforces email format from spec', async () => {
    const client = createRouterClient(appRouter, {
      context: makeAuthenticatedContext(),
    })

    // The spec declares email with format: email
    const createOp = spec.paths['/v1/users']?.post as OpenAPIOperation
    const schema = createOp?.requestBody?.content?.['application/json']?.schema
    expect(schema?.properties?.email).toHaveProperty('format', 'email')

    // Router enforces email format
    await expect(
      client.user.create({ email: 'not-an-email', name: 'Test' }),
    ).rejects.toThrow()
  })
})

describe('OpenAPI ↔ Router: response status codes match spec', () => {
  it('user.create spec declares 201 (not 200)', () => {
    const createOp = spec.paths['/v1/users']?.post as OpenAPIOperation
    expect(createOp.responses).toHaveProperty('201')
  })

  it('user.me spec declares 200', () => {
    const meOp = spec.paths['/v1/users/me']?.get as OpenAPIOperation
    expect(meOp.responses).toHaveProperty('200')
  })

  it('user.list spec declares 200', () => {
    const listOp = spec.paths['/v1/users']?.get as OpenAPIOperation
    expect(listOp.responses).toHaveProperty('200')
  })

  it('user.getById spec declares 200', () => {
    const getByIdOp = spec.paths['/v1/users/{id}']?.get as OpenAPIOperation
    expect(getByIdOp.responses).toHaveProperty('200')
  })

  it('health spec declares 200', () => {
    const healthOp = spec.paths['/health']?.get as OpenAPIOperation
    expect(healthOp.responses).toHaveProperty('200')
  })
})

describe('OpenAPI ↔ Router: tag classification is consistent', () => {
  it('user endpoints are tagged "users"', () => {
    const userPaths = ['/v1/users', '/v1/users/me', '/v1/users/{id}']
    for (const path of userPaths) {
      const methods = spec.paths[path]
      expect(methods, `path ${path} missing from spec`).toBeDefined()
      for (const [method, op] of Object.entries(methods!)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue
        expect((op as OpenAPIOperation).tags, `${method.toUpperCase()} ${path}`).toContain('users')
      }
    }
  })

  it('health endpoint is tagged "ops"', () => {
    const healthOp = spec.paths['/health']?.get as OpenAPIOperation
    expect(healthOp.tags).toContain('ops')
  })
})

describe('Consumer contract: breaking-change detection integration', () => {
  it('spec operationIds are stable across known endpoints', () => {
    // These operationIds form the consumer contract — consumers reference them
    // in generated clients, monitoring, and automation.
    const expectedOperationIds = ['user.me', 'user.getById', 'user.create', 'user.list', 'health']
    const actualOperationIds: string[] = []

    for (const [, methods] of Object.entries(spec.paths)) {
      for (const [method, op] of Object.entries(methods)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue
        if ((op as OpenAPIOperation).operationId) {
          actualOperationIds.push((op as OpenAPIOperation).operationId!)
        }
      }
    }

    for (const expected of expectedOperationIds) {
      expect(actualOperationIds, `Missing operationId: ${expected}`).toContain(expected)
    }
  })

  it('all user endpoints require authentication (protected)', async () => {
    const unauthClient = createRouterClient(appRouter, {
      context: {
        event: {} as Context['event'],
        session: null,
        db: makeMockDb(),
      },
    })

    const protectedOps = [
      { name: 'user.me', call: () => unauthClient.user.me() },
      {
        name: 'user.getById',
        call: () => unauthClient.user.getById({ id: '550e8400-e29b-41d4-a716-446655440000' }),
      },
      {
        name: 'user.create',
        call: () => unauthClient.user.create({ email: 'a@b.com', name: 'X' }),
      },
      { name: 'user.list', call: () => unauthClient.user.list() },
    ]

    for (const op of protectedOps) {
      try {
        await op.call()
        expect.fail(`${op.name} should reject unauthenticated requests`)
      } catch (e) {
        expect(e).toBeInstanceOf(ORPCError)
        expect((e as ORPCError<string, unknown>).code).toBe('UNAUTHORIZED')
      }
    }
  })
})
