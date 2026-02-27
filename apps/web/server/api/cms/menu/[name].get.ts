import { getCmsProvider } from '../../../utils/cms-provider'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') ?? ''
  const cms = getCmsProvider()
  const menu = await cms.getMenu(name)

  if (!menu) {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
  }

  return menu
})
