import { z } from 'zod'
import { getCmsProvider } from '../../utils/cms-provider'

const querySchema = z.object({
  q: z.string().min(1, 'Search query parameter "q" is required'),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))
  const cms = await getCmsProvider()

  return cms.search({
    query: query.q,
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort
  })
})
