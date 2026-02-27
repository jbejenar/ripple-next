// CMS Provider Interface — Drupal/Tide-aligned content model
// Follows the provider pattern used throughout ripple-next.
// Tests ALWAYS use MockCmsProvider — no Drupal dependency in tests.

// ── Content Types ──────────────────────────────────────────────────────

export type ContentStatus = 'published' | 'draft' | 'archived'

export interface CmsImage {
  id: string
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
  focalPoint?: { x: number; y: number }
}

export interface CmsFile {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
}

export interface CmsLink {
  text: string
  url: string
  external?: boolean
}

// ── Page Sections (Tide content components) ────────────────────────────

export interface AccordionItem {
  title: string
  body: string
}

export interface CardItem {
  title: string
  summary: string
  link?: CmsLink
  image?: CmsImage
}

export interface TimelineItem {
  title: string
  subtitle?: string
  body: string
  date?: string
}

export interface CallToAction {
  title: string
  summary: string
  link: CmsLink
  image?: CmsImage
}

export interface KeyDate {
  title: string
  date: string
  description?: string
}

export type PageSection =
  | { type: 'wysiwyg'; html: string }
  | { type: 'accordion'; title?: string; items: AccordionItem[] }
  | { type: 'card-collection'; title?: string; cards: CardItem[] }
  | { type: 'timeline'; title?: string; items: TimelineItem[] }
  | { type: 'call-to-action'; cta: CallToAction }
  | { type: 'key-dates'; title?: string; dates: KeyDate[] }
  | { type: 'image'; image: CmsImage; caption?: string }
  | { type: 'embedded-video'; url: string; title?: string; transcript?: string }

// ── Content Entities ───────────────────────────────────────────────────

export interface CmsPage {
  id: string
  title: string
  slug: string
  summary?: string
  body?: string
  sections: PageSection[]
  featuredImage?: CmsImage
  status: ContentStatus
  contentType: string
  taxonomy: CmsTaxonomyTerm[]
  created: string
  updated: string
  meta: CmsMetadata
}

export interface CmsMetadata {
  title?: string
  description?: string
  ogImage?: CmsImage
  keywords?: string[]
  noIndex?: boolean
}

// ── Taxonomy ───────────────────────────────────────────────────────────

export interface CmsTaxonomyVocabulary {
  id: string
  name: string
  machineName: string
}

export interface CmsTaxonomyTerm {
  id: string
  name: string
  vocabulary: string
  parent?: string
  weight?: number
}

// ── Menus ──────────────────────────────────────────────────────────────

export interface CmsMenuItem {
  id: string
  label: string
  url: string
  parent?: string
  weight: number
  children: CmsMenuItem[]
}

export interface CmsMenu {
  id: string
  name: string
  items: CmsMenuItem[]
}

// ── Search ─────────────────────────────────────────────────────────────

export interface CmsSearchQuery {
  query: string
  filters?: Record<string, string | string[]>
  page?: number
  pageSize?: number
  sort?: string
}

export interface CmsSearchResult {
  items: CmsSearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CmsSearchResultItem {
  id: string
  title: string
  summary: string
  url: string
  contentType: string
  updated: string
}

// ── Route Resolution ───────────────────────────────────────────────────

export interface CmsRoute {
  id: string
  path: string
  contentType: string
  redirect?: string
  statusCode?: number
}

// ── Listing / Pagination ───────────────────────────────────────────────

export interface CmsListOptions {
  contentType?: string
  taxonomy?: { vocabulary: string; term: string }
  status?: ContentStatus
  page?: number
  pageSize?: number
  sort?: 'created' | 'updated' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface CmsListResult {
  items: CmsPage[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Provider Configuration ─────────────────────────────────────────────

export interface CmsProviderConfig {
  baseUrl?: string
  siteId?: string
  auth?: {
    username: string
    password: string
  }
}

// ── CMS Provider Interface ─────────────────────────────────────────────

export interface CmsProvider {
  // Page operations
  getPage(id: string): Promise<CmsPage | null>
  getPageBySlug(slug: string): Promise<CmsPage | null>
  listPages(options?: CmsListOptions): Promise<CmsListResult>

  // Route resolution (Drupal path alias → content)
  resolveRoute(path: string): Promise<CmsRoute | null>

  // Taxonomy
  getTaxonomyVocabulary(machineName: string): Promise<CmsTaxonomyVocabulary | null>
  getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]>

  // Menus
  getMenu(name: string): Promise<CmsMenu | null>

  // Search
  search(query: CmsSearchQuery): Promise<CmsSearchResult>
}
