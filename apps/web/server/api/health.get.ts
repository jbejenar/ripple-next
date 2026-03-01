/**
 * Health check endpoint with dependency probes.
 *
 * Returns overall status + per-dependency status so load balancers,
 * agents, and monitoring can assess service readiness.
 *
 * - GET /api/health        → full health check
 * - GET /api/health?quick  → minimal liveness probe (no dependency checks)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Quick liveness probe — no dependency checks
  if ('quick' in query) {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {}
  let overall: 'ok' | 'degraded' | 'unhealthy' = 'ok'

  // Database check
  try {
    const start = Date.now()
    const { getDatabase } = await import('@ripple-next/db')
    const db = getDatabase()
    await (db as unknown as { execute: (sql: unknown) => Promise<unknown> }).execute(
      /* sql */ 'SELECT 1'
    )
    checks.database = { status: 'ok', latencyMs: Date.now() - start }
  } catch (e) {
    checks.database = {
      status: 'unhealthy',
      error: e instanceof Error ? e.message : 'unknown'
    }
    overall = 'unhealthy'
  }

  // Redis check (via REDIS_URL env var)
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    try {
      const start = Date.now()
      const url = new URL(redisUrl)
      const { createConnection } = await import('node:net')
      await new Promise<void>((resolve, reject) => {
        const socket = createConnection(
          { host: url.hostname, port: Number(url.port) || 6379, timeout: 3000 },
          () => {
            socket.destroy()
            resolve()
          }
        )
        socket.on('error', reject)
        socket.on('timeout', () => {
          socket.destroy()
          reject(new Error('timeout'))
        })
      })
      checks.redis = { status: 'ok', latencyMs: Date.now() - start }
    } catch (e) {
      checks.redis = {
        status: 'unhealthy',
        error: e instanceof Error ? e.message : 'unknown'
      }
      overall = overall === 'unhealthy' ? 'unhealthy' : 'degraded'
    }
  } else {
    checks.redis = { status: 'skipped' }
  }

  const statusCode = overall === 'ok' ? 200 : overall === 'degraded' ? 200 : 503
  setResponseStatus(event, statusCode)

  return {
    status: overall,
    timestamp: new Date().toISOString(),
    checks
  }
})
