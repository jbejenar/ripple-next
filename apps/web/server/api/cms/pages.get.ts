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
  const query = querySchema.parse(getQuery(event))
  const cms = await getCmsProvider()

  return cms.listPages(query)
})
