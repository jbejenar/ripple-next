import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrupalCmsProvider } from '../providers/drupal'

// ── JSON:API fixture helpers ────────────────────────────────────────────

function jsonApiResponse(data: unknown, included: unknown[] = [], meta?: Record<string, unknown>) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ data, included, meta })
  }
}

function jsonApi404() {
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: () => Promise.resolve(null)
  }
}

function makeNode(overrides: Record<string, unknown> = {}) {
  return {
    type: 'node--page',
    id: 'node-uuid-1',
    attributes: {
      title: 'About Us',
      field_slug: 'about-us',
      field_summary: 'Learn more about our team',
      body: { value: '<p>Body content here</p>', processed: '<p>Body content here</p>' },
      status: true,
      created: '2026-01-15T10:00:00Z',
      changed: '2026-02-20T14:30:00Z',
      metatag: { title: 'About Us | Gov', description: 'Government about page' },
      ...overrides
    },
    relationships: {
      field_featured_image: { data: null },
      field_topic: { data: [] },
      field_landing_page_component: { data: [] },
      field_node_paragraphs: { data: [] },
      ...(overrides['relationships'] as Record<string, unknown> ?? {})
    }
  }
}

function makeParagraph(type: string, id: string, attrs: Record<string, unknown> = {}, rels: Record<string, unknown> = {}) {
  return {
    type,
    id,
    attributes: attrs,
    relationships: rels
  }
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('DrupalCmsProvider', () => {
  let provider: DrupalCmsProvider
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    provider = new DrupalCmsProvider({
      baseUrl: 'https://cms.example.com',
      siteId: '4'
    })
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  describe('constructor', () => {
    it('requires baseUrl', () => {
      expect(() => new DrupalCmsProvider({})).toThrow('DrupalCmsProvider requires baseUrl')
    })

    it('strips trailing slash from baseUrl', () => {
      const p = new DrupalCmsProvider({ baseUrl: 'https://cms.example.com/' })
      expect(p).toBeDefined()
    })
  })

  describe('getPage', () => {
    it('fetches and maps a node to CmsPage', async () => {
      const node = makeNode()
      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node))

      const page = await provider.getPage('node-uuid-1')

      expect(page).not.toBeNull()
      expect(page!.id).toBe('node-uuid-1')
      expect(page!.title).toBe('About Us')
      expect(page!.slug).toBe('about-us')
      expect(page!.summary).toBe('Learn more about our team')
      expect(page!.status).toBe('published')
      expect(page!.contentType).toBe('page')
      expect(page!.meta.title).toBe('About Us | Gov')
    })

    it('returns null for 404', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApi404())
      const page = await provider.getPage('nonexistent')
      expect(page).toBeNull()
    })

    it('maps body to wysiwyg section when no paragraphs', async () => {
      const node = makeNode()
      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('wysiwyg')
    })
  })

  describe('getPageBySlug', () => {
    it('normalises slug with leading slash', async () => {
      const node = makeNode()
      fetchSpy.mockResolvedValueOnce(jsonApiResponse([node]))

      await provider.getPageBySlug('/about-us')

      expect(fetchSpy).toHaveBeenCalledOnce()
      const url = fetchSpy.mock.calls[0]![0] as string
      expect(url).toContain('filter[field_slug]=about-us')
    })

    it('returns null when no results', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApiResponse([]))
      const page = await provider.getPageBySlug('nonexistent')
      expect(page).toBeNull()
    })
  })

  describe('listPages', () => {
    it('applies content type, pagination, and sort', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApiResponse([], [], { count: 0 }))

      await provider.listPages({
        contentType: 'news',
        page: 2,
        pageSize: 5,
        sort: 'created',
        sortOrder: 'desc'
      })

      const rawUrl = fetchSpy.mock.calls[0]![0] as string
      const url = decodeURIComponent(rawUrl)
      expect(url).toContain('/jsonapi/node/news')
      expect(url).toContain('page[limit]=5')
      expect(url).toContain('page[offset]=5')
      expect(url).toContain('sort=-created')
    })

    it('applies site filter when siteId configured', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApiResponse([], [], { count: 0 }))
      await provider.listPages()
      const rawUrl = fetchSpy.mock.calls[0]![0] as string
      const url = decodeURIComponent(rawUrl)
      expect(url).toContain('filter[field_site]=4')
    })

    it('returns empty result when no data', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApiResponse(null))
      const result = await provider.listPages()
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('resolveRoute', () => {
    it('resolves path to route', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse({
          type: 'node--page',
          id: 'route-uuid',
          attributes: { path: '/about' }
        })
      )

      const route = await provider.resolveRoute('/about')
      expect(route).not.toBeNull()
      expect(route!.id).toBe('route-uuid')
      expect(route!.path).toBe('/about')
      expect(route!.contentType).toBe('page')
    })

    it('detects redirects', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse({
          type: 'node--page',
          id: 'redirect-uuid',
          attributes: { redirect: '/new-location' }
        })
      )

      const route = await provider.resolveRoute('/old-path')
      expect(route!.redirect).toBe('/new-location')
      expect(route!.statusCode).toBe(301)
    })

    it('returns null for unknown path', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApi404())
      const route = await provider.resolveRoute('/nonexistent')
      expect(route).toBeNull()
    })
  })

  describe('getTaxonomyVocabulary', () => {
    it('fetches and maps vocabulary', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse([{
          type: 'taxonomy_vocabulary--taxonomy_vocabulary',
          id: 'vocab-uuid',
          attributes: { name: 'Topic', vid: 'topic' }
        }])
      )

      const vocab = await provider.getTaxonomyVocabulary('topic')
      expect(vocab).not.toBeNull()
      expect(vocab!.name).toBe('Topic')
      expect(vocab!.machineName).toBe('topic')
    })
  })

  describe('getTaxonomyTerms', () => {
    it('fetches and maps terms', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse([
          {
            type: 'taxonomy_term--topic',
            id: 'term-1',
            attributes: { name: 'Health', weight: 0 },
            relationships: { parent: { data: null } }
          },
          {
            type: 'taxonomy_term--topic',
            id: 'term-2',
            attributes: { name: 'Education', weight: 1 },
            relationships: { parent: { data: null } }
          }
        ])
      )

      const terms = await provider.getTaxonomyTerms('topic')
      expect(terms).toHaveLength(2)
      expect(terms[0]!.name).toBe('Health')
      expect(terms[1]!.name).toBe('Education')
    })
  })

  describe('getMenu', () => {
    it('builds hierarchical menu from flat items', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse([
          {
            type: 'menu_link_content--main',
            id: 'menu-1',
            attributes: { title: 'Home', url: '/', weight: 0 },
            relationships: { parent: { data: null } }
          },
          {
            type: 'menu_link_content--main',
            id: 'menu-2',
            attributes: { title: 'About', url: '/about', weight: 1 },
            relationships: { parent: { data: null } }
          },
          {
            type: 'menu_link_content--main',
            id: 'menu-3',
            attributes: { title: 'Team', url: '/about/team', weight: 0 },
            relationships: { parent: { data: { type: 'menu_link_content--main', id: 'menu-2' } } }
          }
        ])
      )

      const menu = await provider.getMenu('main')
      expect(menu).not.toBeNull()
      expect(menu!.items).toHaveLength(2)
      expect(menu!.items[0]!.label).toBe('Home')
      expect(menu!.items[1]!.label).toBe('About')
      expect(menu!.items[1]!.children).toHaveLength(1)
      expect(menu!.items[1]!.children[0]!.label).toBe('Team')
    })

    it('returns null for unknown menu', async () => {
      fetchSpy.mockResolvedValueOnce(jsonApi404())
      const menu = await provider.getMenu('nonexistent')
      expect(menu).toBeNull()
    })
  })

  describe('search', () => {
    it('maps search results', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse(
          [
            {
              type: 'node--page',
              id: 'search-1',
              attributes: {
                title: 'Health Services',
                field_summary: 'Find health services near you',
                path: '/health',
                changed: '2026-02-01T00:00:00Z'
              }
            }
          ],
          [],
          { count: 1 }
        )
      )

      const result = await provider.search({ query: 'health' })
      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.title).toBe('Health Services')
      expect(result.items[0]!.url).toBe('/health')
      expect(result.total).toBe(1)
    })
  })

  describe('paragraph-to-section mapping', () => {
    it('maps wysiwyg paragraph to section', async () => {
      const wysiwygParagraph = makeParagraph(
        'paragraph--wysiwyg',
        'para-1',
        { field_body: { value: '<p>Rich text</p>', processed: '<p>Rich text</p>' } }
      )

      const node = makeNode({
        relationships: {
          field_featured_image: { data: null },
          field_topic: { data: [] },
          field_landing_page_component: {
            data: [{ type: 'paragraph--wysiwyg', id: 'para-1' }]
          },
          field_node_paragraphs: { data: [] }
        }
      })

      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node, [wysiwygParagraph]))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('wysiwyg')
      if (page!.sections[0]!.type === 'wysiwyg') {
        expect(page!.sections[0]!.html).toBe('<p>Rich text</p>')
      }
    })

    it('maps accordion paragraph with items', async () => {
      const accordionItem1 = makeParagraph(
        'paragraph--accordion_content',
        'acc-item-1',
        {
          field_paragraph_title: 'Question 1',
          field_paragraph_accordion_body: { value: 'Answer 1', processed: 'Answer 1' }
        }
      )
      const accordionItem2 = makeParagraph(
        'paragraph--accordion_content',
        'acc-item-2',
        {
          field_paragraph_title: 'Question 2',
          field_paragraph_accordion_body: { value: 'Answer 2', processed: 'Answer 2' }
        }
      )
      const accordionParagraph = makeParagraph(
        'paragraph--accordion',
        'para-acc',
        { field_paragraph_title: 'FAQ' },
        {
          field_paragraph_accordion: {
            data: [
              { type: 'paragraph--accordion_content', id: 'acc-item-1' },
              { type: 'paragraph--accordion_content', id: 'acc-item-2' }
            ]
          }
        }
      )

      const node = makeNode({
        relationships: {
          field_featured_image: { data: null },
          field_topic: { data: [] },
          field_landing_page_component: {
            data: [{ type: 'paragraph--accordion', id: 'para-acc' }]
          },
          field_node_paragraphs: { data: [] }
        }
      })

      fetchSpy.mockResolvedValueOnce(
        jsonApiResponse(node, [accordionParagraph, accordionItem1, accordionItem2])
      )

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('accordion')
      if (page!.sections[0]!.type === 'accordion') {
        expect(page!.sections[0]!.title).toBe('FAQ')
        expect(page!.sections[0]!.items).toHaveLength(2)
        expect(page!.sections[0]!.items[0]!.title).toBe('Question 1')
        expect(page!.sections[0]!.items[1]!.body).toBe('Answer 2')
      }
    })

    it('maps embedded video paragraph', async () => {
      const videoParagraph = makeParagraph(
        'paragraph--embedded_video',
        'para-vid',
        {
          field_paragraph_media_url: 'https://www.youtube.com/watch?v=abc123',
          field_paragraph_title: 'Demo Video',
          field_paragraph_transcript: { value: 'Transcript text', processed: 'Transcript text' }
        }
      )

      const node = makeNode({
        relationships: {
          field_featured_image: { data: null },
          field_topic: { data: [] },
          field_landing_page_component: {
            data: [{ type: 'paragraph--embedded_video', id: 'para-vid' }]
          },
          field_node_paragraphs: { data: [] }
        }
      })

      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node, [videoParagraph]))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('embedded-video')
      if (page!.sections[0]!.type === 'embedded-video') {
        expect(page!.sections[0]!.url).toContain('youtube')
        expect(page!.sections[0]!.title).toBe('Demo Video')
        expect(page!.sections[0]!.transcript).toBe('Transcript text')
      }
    })

    it('maps multiple mixed paragraph types in order', async () => {
      const wysiwyg = makeParagraph(
        'paragraph--wysiwyg',
        'para-w',
        { field_body: { value: '<p>Intro</p>' } }
      )
      const video = makeParagraph(
        'paragraph--embedded_video',
        'para-v',
        { field_paragraph_media_url: 'https://vimeo.com/12345' }
      )

      const node = makeNode({
        relationships: {
          field_featured_image: { data: null },
          field_topic: { data: [] },
          field_landing_page_component: {
            data: [
              { type: 'paragraph--wysiwyg', id: 'para-w' },
              { type: 'paragraph--embedded_video', id: 'para-v' }
            ]
          },
          field_node_paragraphs: { data: [] }
        }
      })

      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node, [wysiwyg, video]))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(2)
      expect(page!.sections[0]!.type).toBe('wysiwyg')
      expect(page!.sections[1]!.type).toBe('embedded-video')
    })

    it('falls back to body when no paragraph field references', async () => {
      const node = makeNode({ body: { value: '<p>Fallback body</p>' } })
      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('wysiwyg')
    })

    it('skips unknown paragraph types gracefully', async () => {
      const unknown = makeParagraph('paragraph--unknown_type', 'para-u', { field_body: 'test' })
      const wysiwyg = makeParagraph('paragraph--wysiwyg', 'para-w', { field_body: '<p>Text</p>' })

      const node = makeNode({
        relationships: {
          field_featured_image: { data: null },
          field_topic: { data: [] },
          field_landing_page_component: {
            data: [
              { type: 'paragraph--unknown_type', id: 'para-u' },
              { type: 'paragraph--wysiwyg', id: 'para-w' }
            ]
          },
          field_node_paragraphs: { data: [] }
        }
      })

      fetchSpy.mockResolvedValueOnce(jsonApiResponse(node, [unknown, wysiwyg]))

      const page = await provider.getPage('node-uuid-1')
      expect(page!.sections).toHaveLength(1)
      expect(page!.sections[0]!.type).toBe('wysiwyg')
    })
  })

  describe('auth header', () => {
    it('sends basic auth when configured', async () => {
      const authedProvider = new DrupalCmsProvider({
        baseUrl: 'https://cms.example.com',
        auth: { username: 'api-user', password: 'api-pass' }
      })

      fetchSpy.mockResolvedValueOnce(jsonApi404())
      await authedProvider.getPage('test')

      const headers = fetchSpy.mock.calls[0]![1]!.headers as Record<string, string>
      expect(headers['Authorization']).toMatch(/^Basic /)
    })

    it('omits auth header when not configured', async () => {
      const noAuthProvider = new DrupalCmsProvider({
        baseUrl: 'https://cms.example.com'
      })

      fetchSpy.mockResolvedValueOnce(jsonApi404())
      await noAuthProvider.getPage('test')

      const headers = fetchSpy.mock.calls[0]![1]!.headers as Record<string, string>
      expect(headers['Authorization']).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('throws on non-404 HTTP errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(provider.getPage('test')).rejects.toThrow('Drupal API error: 500')
    })
  })
})
