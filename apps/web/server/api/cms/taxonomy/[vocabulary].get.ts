import { getCmsProvider } from '../../../utils/cms-provider'

export default defineEventHandler(async (event) => {
  const vocabulary = getRouterParam(event, 'vocabulary') ?? ''
  const cms = getCmsProvider()
  const terms = await cms.getTaxonomyTerms(vocabulary)
  return terms
})
