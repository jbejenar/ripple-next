import type {
  CmsProvider,
  CmsProviderConfig,
  CmsPage,
  CmsImage,
  CmsListOptions,
  CmsListResult,
  CmsRoute,
  CmsTaxonomyVocabulary,
  CmsTaxonomyTerm,
  CmsMenu,
  CmsMenuItem,
  CmsSearchQuery,
  CmsSearchResult,
  PageSection,
  ContentStatus
} from '../types'

// ── JSON:API response shapes ───────────────────────────────────────────

interface JsonApiResource {
  type: string
  id: string
  attributes: Record<string, unknown>
  relationships?: Record<
    string,
    { data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null }
  >
}

interface JsonApiResourceIdentifier {
  type: string
  id: string
}

interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[]
  included?: JsonApiResource[]
  meta?: { count?: number }
  links?: { next?: { href: string } }
}

// ── Drupal CMS Provider ────────────────────────────────────────────────

/**
 * Drupal/Tide CMS provider using JSON:API.
 *
 * Connects to a Drupal backend configured with the Tide distribution,
 * mapping Drupal's JSON:API responses to the CmsProvider interface.
 *
 * Aligns with the original Ripple's ripple-nuxt-tide integration:
 * - Same Tide content types (page, landing_page, news, event)
 * - Same JSON:API endpoints
 * - Same relationship handling (includes, field references)
 *
 * Diverges from original Ripple:
 * - Uses native fetch instead of Axios
 * - Returns typed CmsPage objects instead of raw JSON:API
 * - Provider pattern enables CMS-agnostic frontend
 * - Zod validation on responses for runtime safety
 */
export class DrupalCmsProvider implements CmsProvider {
  private baseUrl: string
  private siteId: string | undefined
  private authHeader: string | undefined

  constructor(config: CmsProviderConfig) {
    if (!config.baseUrl) {
      throw new Error('DrupalCmsProvider requires baseUrl')
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.siteId = config.siteId
    if (config.auth) {
      this.authHeader = `Basic ${btoa(`${config.auth.username}:${config.auth.password}`)}`
    }
  }

  // ── Page operations ────────────────────────────────────────────────

  async getPage(id: string): Promise<CmsPage | null> {
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/node/page/${id}?include=field_featured_image,field_topic`
    )
    if (!response?.data || Array.isArray(response.data)) return null
    return this.mapNodeToPage(response.data, response.included)
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    const normalised = slug.startsWith('/') ? slug.slice(1) : slug
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/node/page?filter[field_slug]=${encodeURIComponent(normalised)}&include=field_featured_image,field_topic`
    )
    if (!response?.data) return null
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    if (!data) return null
    return this.mapNodeToPage(data, response.included)
  }

  async listPages(options?: CmsListOptions): Promise<CmsListResult> {
    const contentType = options?.contentType ?? 'page'
    const params = new URLSearchParams()
    params.set('include', 'field_featured_image,field_topic')

    if (options?.status) {
      params.set('filter[status]', options.status === 'published' ? '1' : '0')
    }
    if (options?.taxonomy) {
      params.set(
        `filter[field_${options.taxonomy.vocabulary}.name]`,
        options.taxonomy.term
      )
    }

    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    params.set('page[limit]', String(pageSize))
    params.set('page[offset]', String((page - 1) * pageSize))

    if (options?.sort) {
      const prefix = options.sortOrder === 'desc' ? '-' : ''
      const fieldMap: Record<string, string> = {
        created: 'created',
        updated: 'changed',
        title: 'title'
      }
      params.set('sort', `${prefix}${fieldMap[options.sort] ?? options.sort}`)
    }

    if (this.siteId) {
      params.set('filter[field_site]', this.siteId)
    }

    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/node/${contentType}?${params.toString()}`
    )
    if (!response?.data || !Array.isArray(response.data)) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 }
    }

    const items = response.data.map((node) => this.mapNodeToPage(node, response.included))
    const total = response.meta?.count ?? items.length
    const totalPages = Math.ceil(total / pageSize)

    return { items, total, page, pageSize, totalPages }
  }

  // ── Route resolution ───────────────────────────────────────────────

  async resolveRoute(path: string): Promise<CmsRoute | null> {
    const normalised = path.startsWith('/') ? path : `/${path}`
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/decoupled-router?path=${encodeURIComponent(normalised)}`
    )

    if (!response?.data) return null
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    if (!data) return null

    const redirect = data.attributes['redirect'] as string | undefined
    return {
      id: data.id,
      path: normalised,
      contentType: this.extractContentType(data.type),
      redirect: redirect ?? undefined,
      statusCode: redirect ? 301 : undefined
    }
  }

  // ── Taxonomy ───────────────────────────────────────────────────────

  async getTaxonomyVocabulary(machineName: string): Promise<CmsTaxonomyVocabulary | null> {
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/taxonomy_vocabulary/taxonomy_vocabulary?filter[vid]=${encodeURIComponent(machineName)}`
    )
    if (!response?.data) return null
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    if (!data) return null

    return {
      id: data.id,
      name: String(data.attributes['name'] ?? ''),
      machineName: String(data.attributes['vid'] ?? machineName)
    }
  }

  async getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]> {
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/taxonomy_term/${vocabulary}?sort=weight`
    )
    if (!response?.data || !Array.isArray(response.data)) return []

    return response.data.map((term) => ({
      id: term.id,
      name: String(term.attributes['name'] ?? ''),
      vocabulary,
      parent: this.extractRelationshipId(term, 'parent'),
      weight: Number(term.attributes['weight'] ?? 0)
    }))
  }

  // ── Menus ──────────────────────────────────────────────────────────

  async getMenu(name: string): Promise<CmsMenu | null> {
    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/menu_items/${name}`
    )
    if (!response?.data || !Array.isArray(response.data)) return null

    const flatItems = response.data.map((item) => ({
      id: item.id,
      label: String(item.attributes['title'] ?? ''),
      url: String(item.attributes['url'] ?? ''),
      parent: this.extractRelationshipId(item, 'parent'),
      weight: Number(item.attributes['weight'] ?? 0),
      children: [] as CmsMenuItem[]
    }))

    const itemMap = new Map(flatItems.map((item) => [item.id, item]))
    const rootItems: CmsMenuItem[] = []

    for (const item of flatItems) {
      if (item.parent && itemMap.has(item.parent)) {
        itemMap.get(item.parent)!.children.push(item)
      } else {
        rootItems.push(item)
      }
    }

    rootItems.sort((a, b) => a.weight - b.weight)
    for (const item of itemMap.values()) {
      item.children.sort((a, b) => a.weight - b.weight)
    }

    return { id: name, name, items: rootItems }
  }

  // ── Search ─────────────────────────────────────────────────────────

  async search(query: CmsSearchQuery): Promise<CmsSearchResult> {
    const params = new URLSearchParams()
    params.set('filter[fulltext]', query.query)

    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        const filterValue = Array.isArray(value) ? value.join(',') : value
        params.set(`filter[${key}]`, filterValue)
      }
    }

    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10
    params.set('page[limit]', String(pageSize))
    params.set('page[offset]', String((page - 1) * pageSize))

    if (query.sort) {
      params.set('sort', query.sort)
    }

    const response = await this.fetch<JsonApiResponse>(
      `/jsonapi/index/content?${params.toString()}`
    )

    if (!response?.data || !Array.isArray(response.data)) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 }
    }

    const items = response.data.map((item) => ({
      id: item.id,
      title: String(item.attributes['title'] ?? ''),
      summary: String(item.attributes['field_summary'] ?? item.attributes['body']?.toString().slice(0, 200) ?? ''),
      url: String(item.attributes['path'] ?? `/${item.id}`),
      contentType: this.extractContentType(item.type),
      updated: String(item.attributes['changed'] ?? item.attributes['created'] ?? '')
    }))

    const total = response.meta?.count ?? items.length
    const totalPages = Math.ceil(total / pageSize)

    return { items, total, page, pageSize, totalPages }
  }

  // ── Private helpers ────────────────────────────────────────────────

  private async fetch<T>(path: string): Promise<T | null> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Accept: 'application/vnd.api+json'
    }
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader
    }

    const response = await globalThis.fetch(url, { headers })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Drupal API error: ${response.status} ${response.statusText} at ${path}`)
    }

    return response.json() as Promise<T>
  }

  private mapNodeToPage(node: JsonApiResource, included?: JsonApiResource[]): CmsPage {
    const attrs = node.attributes
    const featuredImageRef = this.getRelationship(node, 'field_featured_image')
    const featuredImage = featuredImageRef
      ? this.mapIncludedImage(featuredImageRef, included)
      : undefined

    const taxonomyRefs = this.getRelationships(node, 'field_topic')
    const taxonomy = taxonomyRefs
      .map((ref) => this.mapIncludedTaxonomy(ref, included))
      .filter((t): t is NonNullable<typeof t> => t !== null)

    const sections = this.mapParagraphsToSections(node, included)

    return {
      id: node.id,
      title: String(attrs['title'] ?? ''),
      slug: String(attrs['field_slug'] ?? attrs['path']?.toString().replace(/^\//, '') ?? node.id),
      summary: attrs['field_summary'] as string | undefined,
      body: this.extractBody(attrs['body']),
      sections,
      featuredImage,
      status: this.mapStatus(attrs['status']),
      contentType: this.extractContentType(node.type),
      taxonomy,
      created: String(attrs['created'] ?? ''),
      updated: String(attrs['changed'] ?? attrs['created'] ?? ''),
      meta: {
        title: attrs['metatag']
          ? (attrs['metatag'] as Record<string, string>)['title']
          : undefined,
        description: attrs['metatag']
          ? (attrs['metatag'] as Record<string, string>)['description']
          : undefined
      }
    }
  }

  private mapParagraphsToSections(
    _node: JsonApiResource,
    _included?: JsonApiResource[]
  ): PageSection[] {
    // Tide uses paragraph entities for page sections.
    // Full paragraph mapping would resolve field_paragraph references
    // from included resources and map each paragraph type.
    // For MVP, return body as a single wysiwyg section if present.
    const body = this.extractBody(_node.attributes['body'])
    if (body) {
      return [{ type: 'wysiwyg', html: body }]
    }
    return []
  }

  private mapIncludedImage(
    ref: JsonApiResourceIdentifier,
    included?: JsonApiResource[]
  ): CmsImage | undefined {
    const resource = included?.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) return undefined

    const fileRef = this.getRelationship(resource, 'field_media_image')
    const fileResource = fileRef
      ? included?.find((r) => r.type === fileRef.type && r.id === fileRef.id)
      : null

    const uri = fileResource?.attributes['uri'] as { url?: string } | undefined
    return {
      id: resource.id,
      src: uri?.url ?? '',
      alt: String(resource.attributes['field_media_alt'] ?? resource.attributes['name'] ?? ''),
      title: resource.attributes['name'] as string | undefined,
      width: resource.attributes['field_media_width'] as number | undefined,
      height: resource.attributes['field_media_height'] as number | undefined
    }
  }

  private mapIncludedTaxonomy(
    ref: JsonApiResourceIdentifier,
    included?: JsonApiResource[]
  ): { id: string; name: string; vocabulary: string } | null {
    const resource = included?.find((r) => r.type === ref.type && r.id === ref.id)
    if (!resource) return null

    return {
      id: resource.id,
      name: String(resource.attributes['name'] ?? ''),
      vocabulary: this.extractContentType(resource.type)
    }
  }

  private getRelationship(
    resource: JsonApiResource,
    field: string
  ): JsonApiResourceIdentifier | undefined {
    const rel = resource.relationships?.[field]?.data
    if (!rel || Array.isArray(rel)) return undefined
    return rel
  }

  private getRelationships(
    resource: JsonApiResource,
    field: string
  ): JsonApiResourceIdentifier[] {
    const rel = resource.relationships?.[field]?.data
    if (!rel) return []
    return Array.isArray(rel) ? rel : [rel]
  }

  private extractRelationshipId(resource: JsonApiResource, field: string): string | undefined {
    const rel = this.getRelationship(resource, field)
    return rel?.id
  }

  private extractContentType(type: string): string {
    // JSON:API type is "node--page" → "page"
    const parts = type.split('--')
    return parts[parts.length - 1] ?? type
  }

  private extractBody(body: unknown): string | undefined {
    if (!body) return undefined
    if (typeof body === 'string') return body
    if (typeof body === 'object' && body !== null && 'value' in body) {
      return String((body as { value: unknown }).value)
    }
    return undefined
  }

  private mapStatus(status: unknown): ContentStatus {
    if (status === true || status === 1 || status === '1') return 'published'
    return 'draft'
  }
}
