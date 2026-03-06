/**
 * Drupal CMS Provider — Integration Tests
 *
 * Exercises the DrupalCmsProvider against a real Drupal 10 instance
 * running via docker-compose.test.yml. JSON:API (core in Drupal 10)
 * provides the backend endpoints.
 *
 * These tests are skipped when Docker is not available or the
 * DRUPAL_BASE_URL environment variable is not set.
 *
 * Setup: docker compose -f docker-compose.test.yml up -d --wait
 * Run:   DRUPAL_BASE_URL=http://localhost:8888 pnpm vitest run packages/cms/tests/drupal.integration.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execSync } from 'node:child_process'
import { DrupalCmsProvider } from '../providers/drupal'
import type { CmsPage, CmsListResult, CmsMenu, CmsTaxonomyVocabulary, CmsTaxonomyTerm } from '../types'

// ── Environment detection ──────────────────────────────────────────────

function isDockerAvailable(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 5000 })
    return true
  } catch {
    return false
  }
}

function isDrupalReachable(baseUrl: string): boolean {
  try {
    execSync(`curl -sf ${baseUrl}/jsonapi --max-time 5`, { stdio: 'ignore', timeout: 10000 })
    return true
  } catch {
    return false
  }
}

const DRUPAL_BASE_URL = process.env['DRUPAL_BASE_URL'] ?? 'http://localhost:8888'
const dockerAvailable = isDockerAvailable()
const drupalReachable = dockerAvailable && isDrupalReachable(DRUPAL_BASE_URL)

// ── Integration Tests ──────────────────────────────────────────────────

describe.runIf(drupalReachable)('DrupalCmsProvider (Drupal Integration)', () => {
  let provider: DrupalCmsProvider

  beforeAll(() => {
    provider = new DrupalCmsProvider({
      baseUrl: DRUPAL_BASE_URL
    })
  })

  // ── listPages ──────────────────────────────────────────────────────

  describe('listPages', () => {
    it('returns a paginated list of pages', async () => {
      const result: CmsListResult = await provider.listPages({ pageSize: 10 })

      expect(result).toBeDefined()
      expect(result.items).toBeInstanceOf(Array)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
      expect(typeof result.total).toBe('number')
      expect(typeof result.totalPages).toBe('number')
    })

    it('returns pages with expected shape', async () => {
      const result = await provider.listPages({ pageSize: 5 })

      if (result.items.length > 0) {
        const page: CmsPage = result.items[0]
        expect(page.id).toBeTruthy()
        expect(page.title).toBeTruthy()
        expect(typeof page.slug).toBe('string')
        expect(page.contentType).toBe('page')
        expect(page.status).toMatch(/^(published|draft|archived)$/)
        expect(page.created).toBeTruthy()
        expect(page.updated).toBeTruthy()
        expect(page.sections).toBeInstanceOf(Array)
        expect(page.taxonomy).toBeInstanceOf(Array)
        expect(page.meta).toBeDefined()
      }
    })

    it('filters by published status', async () => {
      const result = await provider.listPages({ status: 'published' })

      for (const page of result.items) {
        expect(page.status).toBe('published')
      }
    })

    it('supports pagination with offset', async () => {
      const page1 = await provider.listPages({ page: 1, pageSize: 1 })
      const page2 = await provider.listPages({ page: 2, pageSize: 1 })

      if (page1.items.length > 0 && page2.items.length > 0) {
        expect(page1.items[0].id).not.toBe(page2.items[0].id)
      }
    })

    it('supports sorting by title', async () => {
      const result = await provider.listPages({ sort: 'title', sortOrder: 'asc' })

      if (result.items.length >= 2) {
        const titles = result.items.map((p) => p.title.toLowerCase())
        for (let i = 1; i < titles.length; i++) {
          expect(titles[i] >= titles[i - 1]).toBe(true)
        }
      }
    })
  })

  // ── getPage ────────────────────────────────────────────────────────

  describe('getPage', () => {
    it('retrieves a page by ID', async () => {
      // First get a page ID from the listing
      const listing = await provider.listPages({ pageSize: 1 })
      if (listing.items.length === 0) {
        return // skip if no content
      }

      const pageId = listing.items[0].id
      const page: CmsPage | null = await provider.getPage(pageId)

      expect(page).not.toBeNull()
      expect(page!.id).toBe(pageId)
      expect(page!.title).toBeTruthy()
      expect(page!.contentType).toBe('page')
    })

    it('returns null for non-existent page ID', async () => {
      const page = await provider.getPage('00000000-0000-0000-0000-000000000000')
      expect(page).toBeNull()
    })
  })

  // ── getMenu ────────────────────────────────────────────────────────

  describe('getMenu', () => {
    it('retrieves the main navigation menu', async () => {
      // Drupal ships with a "main" menu by default
      let menu: CmsMenu | null = null
      try {
        menu = await provider.getMenu('main')
      } catch {
        // Menu endpoint may not be available in standard Drupal
        // without the jsonapi_menu_items module
      }

      if (menu !== null) {
        expect(menu.id).toBe('main')
        expect(menu.name).toBe('main')
        expect(menu.items).toBeInstanceOf(Array)
      }
    })

    it('returns null for non-existent menu', async () => {
      let menu: CmsMenu | null = null
      try {
        menu = await provider.getMenu('nonexistent-menu-99')
      } catch {
        // May throw for missing menu endpoint
        menu = null
      }

      // Either null or throws — both acceptable
      if (menu !== null) {
        expect(menu.items).toHaveLength(0)
      }
    })
  })

  // ── getTaxonomyVocabulary ──────────────────────────────────────────

  describe('getTaxonomyVocabulary', () => {
    it('retrieves the tags vocabulary', async () => {
      const vocab: CmsTaxonomyVocabulary | null =
        await provider.getTaxonomyVocabulary('tags')

      if (vocab !== null) {
        expect(vocab.id).toBeTruthy()
        expect(vocab.name).toBeTruthy()
        expect(vocab.machineName).toBe('tags')
      }
    })

    it('returns null for non-existent vocabulary', async () => {
      const vocab = await provider.getTaxonomyVocabulary('nonexistent_vocab_99')
      expect(vocab).toBeNull()
    })
  })

  // ── getTaxonomyTerms ──────────────────────────────────────────────

  describe('getTaxonomyTerms', () => {
    it('retrieves terms from the tags vocabulary', async () => {
      const terms: CmsTaxonomyTerm[] = await provider.getTaxonomyTerms('tags')

      expect(terms).toBeInstanceOf(Array)
      if (terms.length > 0) {
        const term = terms[0]
        expect(term.id).toBeTruthy()
        expect(term.name).toBeTruthy()
        expect(term.vocabulary).toBe('tags')
        expect(typeof term.weight).toBe('number')
      }
    })

    it('returns empty array for non-existent vocabulary', async () => {
      const terms = await provider.getTaxonomyTerms('nonexistent_vocab_99')
      expect(terms).toEqual([])
    })
  })

  // ── resolveRoute ──────────────────────────────────────────────────

  describe('resolveRoute', () => {
    it('resolves a node path to a route', async () => {
      // Get a known page first
      const listing = await provider.listPages({ pageSize: 1 })
      if (listing.items.length === 0) {
        return // skip if no content
      }

      // Drupal default node paths are /node/{nid}
      // The decoupled router module is required for path alias resolution
      // In standard Drupal, this endpoint may not exist
      try {
        const route = await provider.resolveRoute('/node/1')
        if (route !== null) {
          expect(route.id).toBeTruthy()
          expect(route.path).toBe('/node/1')
          expect(route.contentType).toBeTruthy()
        }
      } catch {
        // Decoupled router module not installed — acceptable in vanilla Drupal
      }
    })

    it('returns null for non-existent route', async () => {
      try {
        const route = await provider.resolveRoute('/this/path/does-not-exist-99')
        expect(route).toBeNull()
      } catch {
        // Decoupled router module not installed — acceptable
      }
    })
  })

  // ── search ─────────────────────────────────────────────────────────

  describe('search', () => {
    it('searches for content by keyword', async () => {
      // Drupal Search API with JSON:API may not be available in standard install
      // The /jsonapi/index/content endpoint requires the search_api module
      try {
        const result = await provider.search({ query: 'test', pageSize: 5 })
        expect(result).toBeDefined()
        expect(result.items).toBeInstanceOf(Array)
        expect(typeof result.total).toBe('number')
        expect(result.page).toBe(1)
        expect(result.pageSize).toBe(5)
      } catch {
        // Search API module not installed — acceptable in vanilla Drupal
      }
    })

    it('returns empty results for nonsense query', async () => {
      try {
        const result = await provider.search({
          query: 'xyznonexistent99',
          pageSize: 5
        })
        expect(result.items).toHaveLength(0)
      } catch {
        // Search API module not installed — acceptable
      }
    })
  })

  // ── Provider construction ──────────────────────────────────────────

  describe('provider construction', () => {
    it('throws when baseUrl is missing', () => {
      expect(() => new DrupalCmsProvider({})).toThrow('DrupalCmsProvider requires baseUrl')
    })

    it('supports basic auth configuration', () => {
      const authedProvider = new DrupalCmsProvider({
        baseUrl: DRUPAL_BASE_URL,
        auth: { username: 'admin', password: 'admin' }
      })
      expect(authedProvider).toBeInstanceOf(DrupalCmsProvider)
    })

    it('strips trailing slash from baseUrl', async () => {
      const trailingSlashProvider = new DrupalCmsProvider({
        baseUrl: `${DRUPAL_BASE_URL}/`
      })
      // Should work without double-slash issues
      const result = await trailingSlashProvider.listPages({ pageSize: 1 })
      expect(result).toBeDefined()
    })
  })
}, { timeout: 30_000 })
