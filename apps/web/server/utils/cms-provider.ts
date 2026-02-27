import type { CmsProvider } from '@ripple/cms'
import { createCmsProvider } from '@ripple/cms'

let provider: CmsProvider | null = null
let providerPromise: Promise<CmsProvider> | null = null

/**
 * Returns the configured CMS provider instance.
 *
 * Uses the factory pattern from @ripple/cms so Drupal-specific code is
 * only loaded when NUXT_CMS_BASE_URL is configured. When not configured
 * (or in test mode), uses MockCmsProvider with zero Drupal dependency.
 *
 * To remove Drupal support entirely, see ADR-011.
 */
export async function getCmsProvider(): Promise<CmsProvider> {
  if (provider) return provider

  // Prevent multiple concurrent factory calls during startup
  if (providerPromise) return providerPromise

  const config = useRuntimeConfig()

  providerPromise = createCmsProvider(
    process.env.NODE_ENV === 'test' || !config.cmsBaseUrl
      ? { type: 'mock' }
      : {
          type: 'drupal',
          baseUrl: config.cmsBaseUrl,
          siteId: config.cmsSiteId || undefined,
          auth: config.cmsAuthUser
            ? { username: config.cmsAuthUser, password: config.cmsAuthPassword ?? '' }
            : undefined
        }
  )

  provider = await providerPromise
  providerPromise = null
  return provider
}
