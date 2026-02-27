import { getCmsProvider } from '../../utils/cms-provider'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cms = getCmsProvider()

  if (!query.path || typeof query.path !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Path query parameter is required' })
  }

  const route = await cms.resolveRoute(query.path)

  if (!route) {
    throw createError({ statusCode: 404, statusMessage: 'Route not found' })
  }

  if (route.redirect) {
    setResponseStatus(event, route.statusCode ?? 301)
    return { redirect: route.redirect }
  }

  return route
})
