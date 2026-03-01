import { os, ORPCError } from '@orpc/server'
import type { Context, AuthenticatedContext } from './context'

/**
 * Base oRPC instance with context type.
 * All procedures derive from this.
 */
export const pub = os.$context<Context>()

/**
 * Auth middleware — requires an authenticated session.
 * Narrows the context to AuthenticatedContext.
 */
const enforceAuth = pub.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: {
      session: context.session as AuthenticatedContext['session']
    }
  })
})

/**
 * Protected procedure — requires authentication.
 * All user-facing data endpoints should use this.
 */
export const protectedProcedure = pub.use(enforceAuth)
