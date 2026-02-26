import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const userRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session?.user ?? null
  }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(255)
      })
    )
    .mutation(async ({ input }) => {
      // Will use UserRepository from @ripple/db
      return {
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        createdAt: new Date()
      }
    }),

  list: protectedProcedure.query(async () => {
    // Will use UserRepository from @ripple/db
    return []
  })
})
