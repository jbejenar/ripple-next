import { z } from 'zod'
import { getCmsProvider } from '../../utils/cms-provider'

const querySchema = z.object({
  q: z.string().min(1, 'Search query parameter "q" is required'),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional()
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

  return cms.search({
    query: result.data.q,
    page: result.data.page,
    pageSize: result.data.pageSize,
    sort: result.data.sort
  })
})
