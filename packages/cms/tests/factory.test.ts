import { describe, it, expect } from 'vitest'
import { createCmsProvider } from '../factory'
import { MockCmsProvider } from '../providers/mock'
import { DrupalCmsProvider } from '../providers/drupal'

describe('createCmsProvider', () => {
  it('creates MockCmsProvider for type "mock"', async () => {
    const provider = await createCmsProvider({ type: 'mock' })
    expect(provider).toBeInstanceOf(MockCmsProvider)
  })

  it('creates DrupalCmsProvider for type "drupal"', async () => {
    const provider = await createCmsProvider({
      type: 'drupal',
      baseUrl: 'https://cms.example.com'
    })
    expect(provider).toBeInstanceOf(DrupalCmsProvider)
  })

  it('throws for unknown provider type', async () => {
    // @ts-expect-error Testing runtime guard for unknown types
    await expect(createCmsProvider({ type: 'unknown' })).rejects.toThrow(
      'Unknown CMS provider type'
    )
  })
})
