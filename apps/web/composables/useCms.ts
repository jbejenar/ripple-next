import type { CmsPage, CmsMenu, CmsSearchResult, CmsListResult, CmsTaxonomyTerm } from '@ripple/cms'

export function useCms() {
  async function getPage(slug: string): Promise<CmsPage | null> {
    const { data } = await useFetch<CmsPage>(`/api/cms/page/${slug}`)
    return data.value ?? null
  }

  async function listPages(options?: {
    contentType?: string
    page?: number
    pageSize?: number
    sort?: string
    sortOrder?: string
  }): Promise<CmsListResult | null> {
    const { data } = await useFetch<CmsListResult>('/api/cms/pages', { query: options })
    return data.value ?? null
  }

  async function getMenu(name: string): Promise<CmsMenu | null> {
    const { data } = await useFetch<CmsMenu>(`/api/cms/menu/${name}`)
    return data.value ?? null
  }

  async function search(
    query: string,
    options?: { page?: number; pageSize?: number }
  ): Promise<CmsSearchResult | null> {
    const { data } = await useFetch<CmsSearchResult>('/api/cms/search', {
      query: { q: query, ...options }
    })
    return data.value ?? null
  }

  async function getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]> {
    const { data } = await useFetch<CmsTaxonomyTerm[]>(`/api/cms/taxonomy/${vocabulary}`)
    return data.value ?? []
  }

  return { getPage, listPages, getMenu, search, getTaxonomyTerms }
}
