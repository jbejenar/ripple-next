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

/**
 * In-memory CMS provider for tests and local dev.
 * No Drupal dependency — stores all content in memory.
 */
export class MockCmsProvider implements CmsProvider {
  private pages = new Map<string, CmsPage>()
  private routes = new Map<string, CmsRoute>()
  private vocabularies = new Map<string, CmsTaxonomyVocabulary>()
  private terms = new Map<string, CmsTaxonomyTerm[]>()
  private menus = new Map<string, CmsMenu>()

  // ── Seed helpers (test fixtures) ───────────────────────────────────

  addPage(page: CmsPage): void {
    this.pages.set(page.id, page)
    this.routes.set(`/${page.slug}`, {
      id: page.id,
      path: `/${page.slug}`,
      contentType: page.contentType
    })
  }

  addVocabulary(vocabulary: CmsTaxonomyVocabulary, vocabTerms: CmsTaxonomyTerm[] = []): void {
    this.vocabularies.set(vocabulary.machineName, vocabulary)
    this.terms.set(vocabulary.machineName, vocabTerms)
  }

  addMenu(menu: CmsMenu): void {
    this.menus.set(menu.name, menu)
  }

  addRoute(route: CmsRoute): void {
    this.routes.set(route.path, route)
  }

  clear(): void {
    this.pages.clear()
    this.routes.clear()
    this.vocabularies.clear()
    this.terms.clear()
    this.menus.clear()
  }

  // ── CmsProvider implementation ─────────────────────────────────────

  async getPage(id: string): Promise<CmsPage | null> {
    return this.pages.get(id) ?? null
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    const normalised = slug.startsWith('/') ? slug.slice(1) : slug
    for (const page of this.pages.values()) {
      if (page.slug === normalised) {
        return page
      }
    }
    return null
  }

  async listPages(options?: CmsListOptions): Promise<CmsListResult> {
    let items = Array.from(this.pages.values())

    if (options?.contentType) {
      items = items.filter((p) => p.contentType === options.contentType)
    }
    if (options?.status) {
      items = items.filter((p) => p.status === options.status)
    }
    if (options?.taxonomy) {
      items = items.filter((p) =>
        p.taxonomy.some(
          (t) => t.vocabulary === options.taxonomy!.vocabulary && t.name === options.taxonomy!.term
        )
      )
    }

    const sortField = options?.sort ?? 'created'
    const sortOrder = options?.sortOrder ?? 'desc'
    items.sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortOrder === 'asc' ? cmp : -cmp
    })

    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)

    return { items, total, page, pageSize, totalPages }
  }

  async resolveRoute(path: string): Promise<CmsRoute | null> {
    const normalised = path.startsWith('/') ? path : `/${path}`
    return this.routes.get(normalised) ?? null
  }

  async getTaxonomyVocabulary(machineName: string): Promise<CmsTaxonomyVocabulary | null> {
    return this.vocabularies.get(machineName) ?? null
  }

  async getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]> {
    return this.terms.get(vocabulary) ?? []
  }

  async getMenu(name: string): Promise<CmsMenu | null> {
    return this.menus.get(name) ?? null
  }

  async search(query: CmsSearchQuery): Promise<CmsSearchResult> {
    const lowerQuery = query.query.toLowerCase()
    let items = Array.from(this.pages.values()).filter(
      (p) =>
        p.status === 'published' &&
        (p.title.toLowerCase().includes(lowerQuery) ||
          (p.summary?.toLowerCase().includes(lowerQuery) ?? false) ||
          (p.body?.toLowerCase().includes(lowerQuery) ?? false))
    )

    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        if (key === 'contentType') {
          const values = Array.isArray(value) ? value : [value]
          items = items.filter((p) => values.includes(p.contentType))
        }
      }
    }

    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedItems = items.slice(start, start + pageSize)

    return {
      items: paginatedItems.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary ?? '',
        url: `/${p.slug}`,
        contentType: p.contentType,
        updated: p.updated
      })),
      total,
      page,
      pageSize,
      totalPages
    }
  }
}
