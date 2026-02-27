import type { CmsProvider, CmsProviderConfig } from './types'

/**
 * CMS Provider Factory
 *
 * Creates CMS provider instances based on configuration. This is the single
 * point where Drupal knowledge enters the system. To remove Drupal entirely:
 *
 * 1. Delete `providers/drupal.ts` and `providers/tide-paragraph-mapper.ts`
 * 2. Remove the 'drupal' case from this factory
 * 3. All tests, UI components, and composables continue to work unchanged
 *
 * This factory supports the "pull out Drupal" requirement by ensuring the
 * frontend, tests, and API layer never import Drupal-specific code directly.
 *
 * @example
 * ```ts
 * // Test/local — no Drupal needed
 * const cms = createCmsProvider({ type: 'mock' })
 *
 * // Production — connects to Drupal/Tide
 * const cms = createCmsProvider({
 *   type: 'drupal',
 *   baseUrl: 'https://content-api.example.com',
 *   siteId: '4',
 *   auth: { username: 'api', password: 'secret' }
 * })
 * ```
 */

export type CmsProviderType = 'mock' | 'drupal'

export interface CmsProviderFactoryOptions extends CmsProviderConfig {
  /** Provider type: 'mock' for tests/local, 'drupal' for Tide integration */
  type: CmsProviderType
}

export async function createCmsProvider(
  options: CmsProviderFactoryOptions
): Promise<CmsProvider> {
  switch (options.type) {
    case 'drupal': {
      // Dynamic import — Drupal code is only loaded when actually needed.
      // This means the Drupal provider and its mapper are tree-shakeable
      // when building for environments that don't use Drupal.
      const { DrupalCmsProvider } = await import('./providers/drupal')
      return new DrupalCmsProvider(options)
    }
    case 'mock': {
      const { MockCmsProvider } = await import('./providers/mock')
      return new MockCmsProvider()
    }
    default: {
      const exhaustive: never = options.type
      throw new Error(`Unknown CMS provider type: ${String(exhaustive)}`)
    }
  }
}
