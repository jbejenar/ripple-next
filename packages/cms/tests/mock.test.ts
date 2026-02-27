import { describe, it, expect, beforeEach } from 'vitest'
import { MockCmsProvider } from '../providers/mock'
import type { CmsPage } from '../types'

function testPage(overrides: Partial<CmsPage> = {}): CmsPage {
  return {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    summary: 'A test page',
    body: '<p>Body</p>',
    sections: [{ type: 'wysiwyg', html: '<p>Body</p>' }],
    status: 'published',
    contentType: 'page',
    taxonomy: [],
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-01T00:00:00Z',
    meta: {},
    ...overrides
  }
}

describe('MockCmsProvider', () => {
  let provider: MockCmsProvider

  beforeEach(() => {
    provider = new MockCmsProvider()
  })

  it('addPage() + getPage() stores and retrieves pages', async () => {
    provider.addPage(testPage())
    const page = await provider.getPage('page-1')
    expect(page).not.toBeNull()
    expect(page!.title).toBe('Test Page')
  })

  it('addPage() auto-registers route', async () => {
    provider.addPage(testPage())
    const route = await provider.resolveRoute('/test-page')
    expect(route).not.toBeNull()
    expect(route!.id).toBe('page-1')
  })

  it('getPageBySlug() handles leading slash', async () => {
    provider.addPage(testPage())
    const page = await provider.getPageBySlug('/test-page')
    expect(page).not.toBeNull()
    expect(page!.id).toBe('page-1')
  })

  it('listPages() filters by status', async () => {
    provider.addPage(testPage({ id: 'p1', slug: 'p1', status: 'published' }))
    provider.addPage(testPage({ id: 'p2', slug: 'p2', status: 'draft' }))
    provider.addPage(testPage({ id: 'p3', slug: 'p3', status: 'archived' }))

    const published = await provider.listPages({ status: 'published' })
    expect(published.items.length).toBe(1)
    expect(published.items[0]!.id).toBe('p1')
  })

  it('listPages() filters by taxonomy', async () => {
    provider.addPage(
      testPage({
        id: 'p1',
        slug: 'p1',
        taxonomy: [{ id: 't1', name: 'Health', vocabulary: 'topic' }]
      })
    )
    provider.addPage(
      testPage({
        id: 'p2',
        slug: 'p2',
        taxonomy: [{ id: 't2', name: 'Education', vocabulary: 'topic' }]
      })
    )

    const result = await provider.listPages({
      taxonomy: { vocabulary: 'topic', term: 'Health' }
    })
    expect(result.items.length).toBe(1)
    expect(result.items[0]!.id).toBe('p1')
  })

  it('listPages() sorts by title ascending', async () => {
    provider.addPage(testPage({ id: 'p1', slug: 'p1', title: 'Banana' }))
    provider.addPage(testPage({ id: 'p2', slug: 'p2', title: 'Apple' }))

    const result = await provider.listPages({ sort: 'title', sortOrder: 'asc' })
    expect(result.items[0]!.title).toBe('Apple')
    expect(result.items[1]!.title).toBe('Banana')
  })

  it('search() filters by contentType', async () => {
    provider.addPage(testPage({ id: 'p1', slug: 'p1', title: 'News One', contentType: 'news' }))
    provider.addPage(testPage({ id: 'p2', slug: 'p2', title: 'Page One', contentType: 'page' }))

    const result = await provider.search({
      query: 'One',
      filters: { contentType: 'news' }
    })
    expect(result.items.length).toBe(1)
    expect(result.items[0]!.contentType).toBe('news')
  })

  it('search() only returns published pages', async () => {
    provider.addPage(testPage({ id: 'p1', slug: 'p1', title: 'Find Me', status: 'published' }))
    provider.addPage(testPage({ id: 'p2', slug: 'p2', title: 'Find Me Too', status: 'draft' }))

    const result = await provider.search({ query: 'Find' })
    expect(result.items.length).toBe(1)
    expect(result.items[0]!.id).toBe('p1')
  })

  it('clear() removes all data', async () => {
    provider.addPage(testPage())
    provider.addVocabulary({ id: 'v1', name: 'V', machineName: 'v' })
    provider.addMenu({ id: 'm1', name: 'main', items: [] })

    provider.clear()

    expect(await provider.getPage('page-1')).toBeNull()
    expect(await provider.getTaxonomyVocabulary('v')).toBeNull()
    expect(await provider.getMenu('main')).toBeNull()
  })

  it('addVocabulary() + getTaxonomyTerms() stores and retrieves terms', async () => {
    provider.addVocabulary(
      { id: 'v1', name: 'Topics', machineName: 'topic' },
      [
        { id: 't1', name: 'Health', vocabulary: 'topic', weight: 0 },
        { id: 't2', name: 'Education', vocabulary: 'topic', weight: 1 }
      ]
    )

    const terms = await provider.getTaxonomyTerms('topic')
    expect(terms.length).toBe(2)
    expect(terms[0]!.name).toBe('Health')
  })

  it('addMenu() + getMenu() stores and retrieves menus', async () => {
    provider.addMenu({
      id: 'footer',
      name: 'footer',
      items: [{ id: 'f1', label: 'Privacy', url: '/privacy', weight: 0, children: [] }]
    })

    const menu = await provider.getMenu('footer')
    expect(menu).not.toBeNull()
    expect(menu!.items.length).toBe(1)
    expect(menu!.items[0]!.label).toBe('Privacy')
  })
})
