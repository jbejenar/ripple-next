import type { CmsProvider } from '@ripple/cms'
import { MockCmsProvider, DrupalCmsProvider } from '@ripple/cms'

let provider: CmsProvider | null = null

export function getCmsProvider(): CmsProvider {
  if (provider) return provider

  const config = useRuntimeConfig()

  if (process.env.NODE_ENV === 'test' || !config.cmsBaseUrl) {
    provider = new MockCmsProvider()
    return provider
  }

  provider = new DrupalCmsProvider({
    baseUrl: config.cmsBaseUrl,
    siteId: config.cmsSiteId || undefined,
    auth: config.cmsAuthUser
      ? { username: config.cmsAuthUser, password: config.cmsAuthPassword ?? '' }
      : undefined
  })

  return provider
}
