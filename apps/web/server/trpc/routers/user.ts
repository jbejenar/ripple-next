import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { UserRepository } from '@ripple/db'
import { router, protectedProcedure } from '../trpc'

export const userRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session?.user ?? null
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const repo = new UserRepository(ctx.db)
      const user = await repo.findById(input.id)
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }
      return user
    }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(255)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = new UserRepository(ctx.db)
      const existing = await repo.findByEmail(input.email)
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
      }
      return repo.create({ email: input.email, name: input.name, role: 'user' })
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const repo = new UserRepository(ctx.db)
    return repo.list()
  })
})
