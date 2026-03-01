import { getCmsProvider } from '../../utils/cms-provider'
import type { CmsListOptions } from '@ripple-next/cms'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cms = await getCmsProvider()

  const options: CmsListOptions = {
    contentType: query.contentType as string | undefined,
    status: query.status as CmsListOptions['status'],
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    sort: query.sort as CmsListOptions['sort'],
    sortOrder: query.sortOrder as CmsListOptions['sortOrder']
  }

  return cms.listPages(options)
})
