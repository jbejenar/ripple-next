/**
 * CMS Provider Conformance Suite
 *
 * Every CmsProvider implementation must pass these tests.
 *
 * @example
 * ```ts
 * import { cmsConformance } from '@ripple-next/testing/conformance/cms.conformance'
 * import { MockCmsProvider } from '@ripple-next/cms'
 *
 * cmsConformance({
 *   name: 'MockCmsProvider',
 *   factory: () => {
 *     const provider = new MockCmsProvider()
 *     // seed test data
 *     provider.addPage(testPage)
 *     return provider
 *   },
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { CmsProvider, CmsPage } from '@ripple-next/cms'

interface CmsConformanceOptions {
  name: string
  factory: () => CmsProvider
  seed: (provider: CmsProvider) => Promise<void> | void
  cleanup?: () => Promise<void>
}

function createTestPage(overrides: Partial<CmsPage> = {}): CmsPage {
  return {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    summary: 'A test page for conformance',
    body: '<p>Test body content</p>',
    sections: [{ type: 'wysiwyg', html: '<p>Test body content</p>' }],
    status: 'published',
    contentType: 'page',
    taxonomy: [{ id: 'term-1', name: 'Topic A', vocabulary: 'topic' }],
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-15T00:00:00Z',
    meta: { title: 'Test Page | Site', description: 'A test page' },
    ...overrides
  }
}

function createTestPageTwo(): CmsPage {
  return createTestPage({
    id: 'page-2',
    title: 'Second Page',
    slug: 'second-page',
    summary: 'Another page',
    body: '<p>Second body</p>',
    sections: [{ type: 'wysiwyg', html: '<p>Second body</p>' }],
    contentType: 'news',
    taxonomy: [{ id: 'term-2', name: 'Topic B', vocabulary: 'topic' }],
    created: '2026-02-01T00:00:00Z',
    updated: '2026-02-15T00:00:00Z',
    meta: {}
  })
}

function createDraftPage(): CmsPage {
  return createTestPage({
    id: 'page-3',
    title: 'Draft Page',
    slug: 'draft-page',
    status: 'draft',
    created: '2026-03-01T00:00:00Z',
    updated: '2026-03-01T00:00:00Z'
  })
}

export function cmsConformance({ name, factory, seed, cleanup }: CmsConformanceOptions): void {
  describe(`CmsProvider conformance: ${name}`, () => {
    let provider: CmsProvider

    beforeEach(async () => {
      provider = factory()
      await seed(provider)
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    // ── Page operations ──────────────────────────────────────────────

    it('getPage() returns a page by id', async () => {
      const page = await provider.getPage('page-1')
      expect(page).not.toBeNull()
      expect(page!.id).toBe('page-1')
      expect(page!.title).toBe('Test Page')
      expect(page!.slug).toBe('test-page')
      expect(page!.status).toBe('published')
    })

    it('getPage() returns null for non-existent id', async () => {
      const page = await provider.getPage('nonexistent-id')
      expect(page).toBeNull()
    })

    it('getPageBySlug() returns a page by slug', async () => {
      const page = await provider.getPageBySlug('test-page')
      expect(page).not.toBeNull()
      expect(page!.slug).toBe('test-page')
      expect(page!.title).toBe('Test Page')
    })

    it('getPageBySlug() returns null for non-existent slug', async () => {
      const page = await provider.getPageBySlug('nonexistent-slug')
      expect(page).toBeNull()
    })

    it('listPages() returns all published pages', async () => {
      const result = await provider.listPages()
      expect(result.items.length).toBeGreaterThanOrEqual(2)
      expect(result.total).toBeGreaterThanOrEqual(2)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBeGreaterThan(0)
    })

    it('listPages() filters by contentType', async () => {
      const result = await provider.listPages({ contentType: 'news' })
      expect(result.items.length).toBeGreaterThanOrEqual(1)
      for (const item of result.items) {
        expect(item.contentType).toBe('news')
      }
    })

    it('listPages() supports pagination', async () => {
      const result = await provider.listPages({ page: 1, pageSize: 1 })
      expect(result.items.length).toBe(1)
      expect(result.pageSize).toBe(1)
      expect(result.totalPages).toBeGreaterThanOrEqual(2)
    })

    // ── Route resolution ─────────────────────────────────────────────

    it('resolveRoute() returns route for known path', async () => {
      const route = await provider.resolveRoute('/test-page')
      expect(route).not.toBeNull()
      expect(route!.path).toBe('/test-page')
      expect(route!.contentType).toBeTruthy()
    })

    it('resolveRoute() returns null for unknown path', async () => {
      const route = await provider.resolveRoute('/nonexistent-path')
      expect(route).toBeNull()
    })

    // ── Taxonomy ─────────────────────────────────────────────────────

    it('getTaxonomyVocabulary() returns vocabulary by machine name', async () => {
      const vocab = await provider.getTaxonomyVocabulary('topic')
      expect(vocab).not.toBeNull()
      expect(vocab!.machineName).toBe('topic')
    })

    it('getTaxonomyVocabulary() returns null for unknown vocabulary', async () => {
      const vocab = await provider.getTaxonomyVocabulary('nonexistent-vocab')
      expect(vocab).toBeNull()
    })

    it('getTaxonomyTerms() returns terms for vocabulary', async () => {
      const terms = await provider.getTaxonomyTerms('topic')
      expect(terms.length).toBeGreaterThanOrEqual(1)
      for (const term of terms) {
        expect(term.vocabulary).toBe('topic')
        expect(term.name).toBeTruthy()
      }
    })

    it('getTaxonomyTerms() returns empty for unknown vocabulary', async () => {
      const terms = await provider.getTaxonomyTerms('nonexistent-vocab')
      expect(terms).toEqual([])
    })

    // ── Menus ────────────────────────────────────────────────────────

    it('getMenu() returns menu by name', async () => {
      const menu = await provider.getMenu('main')
      expect(menu).not.toBeNull()
      expect(menu!.name).toBe('main')
      expect(menu!.items.length).toBeGreaterThanOrEqual(1)
    })

    it('getMenu() returns null for unknown menu', async () => {
      const menu = await provider.getMenu('nonexistent-menu')
      expect(menu).toBeNull()
    })

    // ── Search ───────────────────────────────────────────────────────

    it('search() returns matching results', async () => {
      const result = await provider.search({ query: 'Test' })
      expect(result.items.length).toBeGreaterThanOrEqual(1)
      expect(result.total).toBeGreaterThanOrEqual(1)
      expect(result.page).toBe(1)
    })

    it('search() returns empty for no matches', async () => {
      const result = await provider.search({ query: 'zzz-no-match-zzz' })
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })

    it('search() supports pagination', async () => {
      const result = await provider.search({ query: 'Page', page: 1, pageSize: 1 })
      expect(result.items.length).toBeLessThanOrEqual(1)
      expect(result.pageSize).toBe(1)
    })
  })
}

export { createTestPage, createTestPageTwo, createDraftPage }
export type { CmsConformanceOptions }
