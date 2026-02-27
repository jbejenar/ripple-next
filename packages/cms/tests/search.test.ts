import { describe, it, expect, beforeEach } from 'vitest'
import type { CmsSearchResult } from '../types'
import { MockCmsProvider } from '../providers/mock'
import { SearchEnhancedCmsProvider } from '../providers/search'
import type { SearchEngine, SearchDocument } from '../providers/search'

class MemorySearchEngine implements SearchEngine {
  private documents: SearchDocument[] = []

  async search(query: string, options?: {
    filters?: Record<string, string | string[]>
    page?: number
    pageSize?: number
    sort?: string
  }): Promise<CmsSearchResult> {
    const lowerQuery = query.toLowerCase()
    let items = this.documents.filter(
      (d) =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.summary.toLowerCase().includes(lowerQuery) ||
        (d.body?.toLowerCase().includes(lowerQuery) ?? false)
    )

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (key === 'contentType') {
          const values = Array.isArray(value) ? value : [value]
          items = items.filter((d) => values.includes(d.contentType))
        }
      }
    }

    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedItems = items.slice(start, start + pageSize)

    return {
      items: paginatedItems.map((d) => ({
        id: d.id,
        title: d.title,
        summary: d.summary,
        url: d.url,
        contentType: d.contentType,
        updated: d.updated
      })),
      total,
      page,
      pageSize,
      totalPages
    }
  }

  async index(documents: SearchDocument[]): Promise<void> {
    for (const doc of documents) {
      const existing = this.documents.findIndex((d) => d.id === doc.id)
      if (existing >= 0) {
        this.documents[existing] = doc
      } else {
        this.documents.push(doc)
      }
    }
  }
}

describe('SearchEnhancedCmsProvider', () => {
  let mock: MockCmsProvider
  let engine: MemorySearchEngine
  let provider: SearchEnhancedCmsProvider

  beforeEach(async () => {
    mock = new MockCmsProvider()
    mock.addPage({
      id: 'p1',
      title: 'Health Services',
      slug: 'health-services',
      summary: 'Government health services',
      body: '<p>Health info</p>',
      sections: [{ type: 'wysiwyg', html: '<p>Health info</p>' }],
      status: 'published',
      contentType: 'page',
      taxonomy: [],
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-15T00:00:00Z',
      meta: {}
    })
    mock.addPage({
      id: 'p2',
      title: 'Education Programs',
      slug: 'education-programs',
      summary: 'Government education programs',
      body: '<p>Education info</p>',
      sections: [{ type: 'wysiwyg', html: '<p>Education info</p>' }],
      status: 'published',
      contentType: 'news',
      taxonomy: [],
      created: '2026-02-01T00:00:00Z',
      updated: '2026-02-15T00:00:00Z',
      meta: {}
    })

    engine = new MemorySearchEngine()
    await engine.index([
      {
        id: 'p1',
        title: 'Health Services',
        summary: 'Government health services',
        body: 'Health info',
        url: '/health-services',
        contentType: 'page',
        updated: '2026-01-15T00:00:00Z'
      },
      {
        id: 'p2',
        title: 'Education Programs',
        summary: 'Government education programs',
        body: 'Education info',
        url: '/education-programs',
        contentType: 'news',
        updated: '2026-02-15T00:00:00Z'
      }
    ])

    provider = new SearchEnhancedCmsProvider(mock, engine)
  })

  it('delegates search to search engine', async () => {
    const result = await provider.search({ query: 'Health' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.title).toBe('Health Services')
  })

  it('search supports filters', async () => {
    const result = await provider.search({
      query: 'Government',
      filters: { contentType: 'news' }
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.contentType).toBe('news')
  })

  it('search supports pagination', async () => {
    const result = await provider.search({ query: 'Government', page: 1, pageSize: 1 })
    expect(result.items).toHaveLength(1)
    expect(result.pageSize).toBe(1)
    expect(result.totalPages).toBe(2)
  })

  it('returns empty results for no matches', async () => {
    const result = await provider.search({ query: 'zzz-no-match-zzz' })
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('delegates getPage to inner provider', async () => {
    const page = await provider.getPage('p1')
    expect(page).not.toBeNull()
    expect(page!.title).toBe('Health Services')
  })

  it('delegates getPageBySlug to inner provider', async () => {
    const page = await provider.getPageBySlug('health-services')
    expect(page).not.toBeNull()
    expect(page!.id).toBe('p1')
  })

  it('delegates listPages to inner provider', async () => {
    const result = await provider.listPages()
    expect(result.items.length).toBeGreaterThanOrEqual(2)
  })

  it('delegates getMenu to inner provider', async () => {
    mock.addMenu({
      id: 'm1',
      name: 'main',
      items: [{ id: 'mi1', label: 'Home', url: '/', weight: 0, children: [] }]
    })
    const menu = await provider.getMenu('main')
    expect(menu).not.toBeNull()
    expect(menu!.name).toBe('main')
  })
})

describe('MemorySearchEngine', () => {
  let engine: MemorySearchEngine

  beforeEach(async () => {
    engine = new MemorySearchEngine()
    await engine.index([
      {
        id: '1',
        title: 'First Document',
        summary: 'First summary',
        url: '/first',
        contentType: 'page',
        updated: '2026-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Second Document',
        summary: 'Second summary',
        url: '/second',
        contentType: 'news',
        updated: '2026-02-01T00:00:00Z'
      }
    ])
  })

  it('finds documents by title', async () => {
    const result = await engine.search('First')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('1')
  })

  it('finds documents by summary', async () => {
    const result = await engine.search('Second summary')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('2')
  })

  it('filters by contentType', async () => {
    const result = await engine.search('Document', { filters: { contentType: 'news' } })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.contentType).toBe('news')
  })

  it('paginates results', async () => {
    const result = await engine.search('Document', { page: 1, pageSize: 1 })
    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(2)
    expect(result.totalPages).toBe(2)
  })

  it('updates existing documents on re-index', async () => {
    await engine.index([
      {
        id: '1',
        title: 'Updated First',
        summary: 'Updated summary',
        url: '/first',
        contentType: 'page',
        updated: '2026-03-01T00:00:00Z'
      }
    ])
    const result = await engine.search('Updated')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.title).toBe('Updated First')
  })
})
