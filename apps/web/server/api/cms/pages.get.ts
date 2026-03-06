import { z } from 'zod'
import { getCmsProvider } from '../../utils/cms-provider'
import { contentStatusSchema } from '@ripple-next/validation'

const querySchema = z.object({
  contentType: z.string().optional(),
  status: contentStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(['created', 'updated', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export default defineEventHandler(async (event) => {
  const result = querySchema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameters',
      data: { errors: result.error.flatten().fieldErrors }
    })
  }
  const cms = await getCmsProvider()

  return cms.listPages(result.data)
})
