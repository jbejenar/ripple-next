import { z } from 'zod'
import { ORPCError } from '@orpc/server'
import { UserRepository } from '@ripple-next/db'
import { protectedProcedure } from '../base'
import type { Context } from '../context'

function requireDb(ctx: Context): NonNullable<Context['db']> {
  if (!ctx.db) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Database not configured'
    })
  }
  return ctx.db
}

export const me = protectedProcedure
  .route({ method: 'GET', path: '/v1/users/me', tags: ['users'] })
  .meta({ visibility: 'public' })
  .handler(({ context }) => {
    return context.session.user
  })

export const getById = protectedProcedure
  .route({ method: 'GET', path: '/v1/users/{id}', tags: ['users'] })
  .meta({ visibility: 'public' })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, input }) => {
    const repo = new UserRepository(requireDb(context))
    const user = await repo.findById(input.id)
    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' })
    }
    return user
  })

export const create = protectedProcedure
  .route({ method: 'POST', path: '/v1/users', tags: ['users'], successStatus: 201 })
  .meta({ visibility: 'public' })
  .input(
    z.object({
      email: z.string().email(),
      name: z.string().min(1).max(255)
    })
  )
  .handler(async ({ context, input }) => {
    const repo = new UserRepository(requireDb(context))
    const existing = await repo.findByEmail(input.email)
    if (existing) {
      throw new ORPCError('CONFLICT', { message: 'Email already in use' })
    }
    return repo.create({ email: input.email, name: input.name, role: 'user' })
  })

export const list = protectedProcedure
  .route({ method: 'GET', path: '/v1/users', tags: ['users'] })
  .meta({ visibility: 'public' })
  .handler(async ({ context }) => {
    const repo = new UserRepository(requireDb(context))
    return repo.list()
  })
