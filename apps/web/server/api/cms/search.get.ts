import { getCmsProvider } from '../../utils/cms-provider'
import type { CmsSearchQuery } from '@ripple/cms'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cms = await getCmsProvider()

  if (!query.q || typeof query.q !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Search query parameter "q" is required' })
  }

  const searchQuery: CmsSearchQuery = {
    query: query.q,
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    sort: query.sort as string | undefined
  }

  return cms.search(searchQuery)
})
