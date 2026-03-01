import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { appRouter } from '../../orpc/router'
import { createContext } from '../../orpc/context'

const handler = new OpenAPIHandler(appRouter)

export default defineEventHandler(async (event) => {
  const context = await createContext(event)

  const request = toWebRequest(event)
  const { matched, response } = await handler.handle(request, {
    prefix: '/api/orpc',
    context
  })

  if (matched) {
    return sendWebResponse(event, response)
  }

  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
