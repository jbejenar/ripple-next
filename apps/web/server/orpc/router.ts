import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import * as userRouter from './routers/user'
import { healthCheck } from './routers/health'

/**
 * Application router — all oRPC procedures registered here.
 *
 * This is the single source of truth for the API surface.
 * OpenAPI spec is generated from this definition.
 */
export const appRouter = {
  user: {
    me: userRouter.me,
    getById: userRouter.getById,
    create: userRouter.create,
    list: userRouter.list
  },
  health: healthCheck
}

export type AppRouter = typeof appRouter

/**
 * Generate OpenAPI 3.1.1 spec from the router definition.
 * Called by `pnpm generate:openapi` (scripts/generate-openapi.mjs).
 */
export async function generateOpenAPI(options: { publicOnly?: boolean } = {}) {
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()]
  })

  const spec = await generator.generate(appRouter, {
    info: {
      title: 'Ripple Next API',
      version: '1.0.0',
      description:
        'Government digital platform API. Public endpoints are versioned and breaking-change gated (ADR-021).'
    },
    servers: [{ url: '/api' }],
    filter: options.publicOnly
      ? ({ contract }) => {
          const def = contract['~orpc'] as { meta?: Record<string, unknown> }
          return def?.meta?.visibility === 'public'
        }
      : undefined
  })

  return spec
}
