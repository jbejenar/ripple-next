import { pub } from '../base'

export const healthCheck = pub
  .route({ method: 'GET', path: '/health', tags: ['ops'] })
  .meta({ visibility: 'internal' })
  .handler(() => {
    return { status: 'ok' as const, timestamp: new Date().toISOString() }
  })
