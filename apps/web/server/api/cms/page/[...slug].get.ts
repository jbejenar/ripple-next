import { getCmsProvider } from '../../../utils/cms-provider'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const cms = await getCmsProvider()
  const page = await cms.getPageBySlug(slug)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return page
})
