/**
 * Contract tests for the /api/health endpoint.
 *
 * Tests the handler logic directly by injecting mock H3 events.
 * Verifies the response shape contract that monitoring/agents depend on.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the H3 auto-imports that Nuxt provides
const mockGetQuery = vi.fn()
const mockSetResponseStatus = vi.fn()
vi.stubGlobal('getQuery', mockGetQuery)
vi.stubGlobal('setResponseStatus', mockSetResponseStatus)
vi.stubGlobal('defineEventHandler', (handler: (event: unknown) => unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({}))

describe('/api/health', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default: no REDIS_URL
    delete process.env.REDIS_URL
  })

  it('quick probe returns {status: "ok", timestamp} without dependency checks', async () => {
    mockGetQuery.mockReturnValue({ quick: '' })

    const { default: handler } = await import('../../../server/api/health.get')
    const result = await (handler as (event: unknown) => Promise<unknown>)({})

    expect(result).toMatchObject({
      status: 'ok',
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
    })
    // Quick probe should NOT set status code or check dependencies
    expect(mockSetResponseStatus).not.toHaveBeenCalled()
  })

  it('full check response shape matches contract', async () => {
    mockGetQuery.mockReturnValue({})

    // Mock the DB import to simulate unhealthy (no real DB in unit test)
    vi.doMock('@ripple-next/db', () => ({
      getDatabase: () => ({
        execute: () => Promise.reject(new Error('no db'))
      })
    }))

    const { default: handler } = await import('../../../server/api/health.get')
    const result = (await (handler as (event: unknown) => Promise<unknown>)({})) as Record<
      string,
      unknown
    >

    // Contract: response always has these fields
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('checks')

    // Status is one of the defined values
    expect(['ok', 'degraded', 'unhealthy']).toContain(result.status)

    // Checks is an object with known structure per dependency
    const checks = result.checks as Record<string, { status: string } | undefined>
    expect(checks.database).toBeDefined()
    expect(['ok', 'unhealthy']).toContain(checks.database!.status)

    // Redis check present (skipped when no REDIS_URL)
    expect(checks.redis).toBeDefined()
    expect(checks.redis!.status).toBe('skipped')
  })
})
