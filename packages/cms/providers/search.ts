import type {
  CmsProvider,
  CmsPage,
  CmsListOptions,
  CmsListResult,
  CmsRoute,
  CmsTaxonomyVocabulary,
  CmsTaxonomyTerm,
  CmsMenu,
  CmsSearchQuery,
  CmsSearchResult
} from '../types'

// ── Search Provider Interface ────────────────────────────────────────
// A dedicated search provider that wraps a CmsProvider but delegates
// search queries to an external search engine (MeiliSearch, Elasticsearch).
// All non-search operations are forwarded to the underlying CMS provider.

export interface SearchEngineConfig {
  host: string
  apiKey?: string
  indexName?: string
}

export interface SearchEngine {
  search(query: string, options?: {
    filters?: Record<string, string | string[]>
    page?: number
    pageSize?: number
    sort?: string
  }): Promise<CmsSearchResult>
  index(documents: SearchDocument[]): Promise<void>
}

export interface SearchDocument {
  id: string
  title: string
  summary: string
  body?: string
  url: string
  contentType: string
  updated: string
}

// ── MeiliSearch Engine (local dev) ───────────────────────────────────

export class MeiliSearchEngine implements SearchEngine {
  private host: string
  private apiKey: string
  private indexName: string

  constructor(config: SearchEngineConfig) {
    this.host = config.host
    this.apiKey = config.apiKey ?? ''
    this.indexName = config.indexName ?? 'pages'
  }

  async search(query: string, options?: {
    filters?: Record<string, string | string[]>
    page?: number
    pageSize?: number
    sort?: string
  }): Promise<CmsSearchResult> {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const offset = (page - 1) * pageSize

    const body: Record<string, unknown> = {
      q: query,
      limit: pageSize,
      offset
    }

    if (options?.filters) {
      const filterParts: string[] = []
      for (const [key, value] of Object.entries(options.filters)) {
        const values = Array.isArray(value) ? value : [value]
        filterParts.push(values.map((v) => `${key} = "${v}"`).join(' OR '))
      }
      if (filterParts.length > 0) {
        body.filter = filterParts.join(' AND ')
      }
    }

    if (options?.sort) {
      body.sort = [options.sort]
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(
      `${this.host}/indexes/${this.indexName}/search`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      throw new Error(`MeiliSearch error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as {
      hits: Array<{
        id: string
        title: string
        summary: string
        url: string
        contentType: string
        updated: string
      }>
      estimatedTotalHits: number
    }

    const total = data.estimatedTotalHits
    const totalPages = Math.ceil(total / pageSize)

    return {
      items: data.hits.map((hit) => ({
        id: hit.id,
        title: hit.title,
        summary: hit.summary ?? '',
        url: hit.url,
        contentType: hit.contentType,
        updated: hit.updated
      })),
      total,
      page,
      pageSize,
      totalPages
    }
  }

  async index(documents: SearchDocument[]): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(
      `${this.host}/indexes/${this.indexName}/documents`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(documents)
      }
    )

    if (!response.ok) {
      throw new Error(`MeiliSearch index error: ${response.status} ${response.statusText}`)
    }
  }
}

// ── Search-Enhanced CMS Provider ─────────────────────────────────────
// Wraps a CmsProvider and delegates search to a dedicated search engine.
// All other operations pass through to the underlying provider.

export class SearchEnhancedCmsProvider implements CmsProvider {
  constructor(
    private inner: CmsProvider,
    private engine: SearchEngine
  ) {}

  async getPage(id: string): Promise<CmsPage | null> {
    return this.inner.getPage(id)
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    return this.inner.getPageBySlug(slug)
  }

  async listPages(options?: CmsListOptions): Promise<CmsListResult> {
    return this.inner.listPages(options)
  }

  async resolveRoute(path: string): Promise<CmsRoute | null> {
    return this.inner.resolveRoute(path)
  }

  async getTaxonomyVocabulary(machineName: string): Promise<CmsTaxonomyVocabulary | null> {
    return this.inner.getTaxonomyVocabulary(machineName)
  }

  async getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]> {
    return this.inner.getTaxonomyTerms(vocabulary)
  }

  async getMenu(name: string): Promise<CmsMenu | null> {
    return this.inner.getMenu(name)
  }

  async search(query: CmsSearchQuery): Promise<CmsSearchResult> {
    return this.engine.search(query.query, {
      filters: query.filters,
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort
    })
  }
}
