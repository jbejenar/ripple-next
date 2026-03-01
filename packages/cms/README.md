# @ripple-next/cms

CMS provider abstraction aligned with the Drupal/Tide content model. Supports pages, menus, taxonomies, routes, and search.

## Install

```bash
pnpm add @ripple-next/cms
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `MockCmsProvider` | Tests, local dev | In-memory fixtures |
| `DrupalCmsProvider` | Production | Drupal JSON:API (Tide) |
| `SearchEnhancedCmsProvider` | Production + search | Wraps any `CmsProvider` with a `SearchEngine` |

## Interface

```typescript
interface CmsProvider {
  getPage(id: string): Promise<CmsPage | null>
  getPageBySlug(slug: string): Promise<CmsPage | null>
  listPages(options?: CmsListOptions): Promise<CmsListResult>
  resolveRoute(path: string): Promise<CmsRoute | null>
  getTaxonomyVocabulary(machineName: string): Promise<CmsTaxonomyVocabulary | null>
  getTaxonomyTerms(vocabulary: string): Promise<CmsTaxonomyTerm[]>
  getMenu(name: string): Promise<CmsMenu | null>
  search(query: CmsSearchQuery): Promise<CmsSearchResult>
}
```

## Usage

```typescript
import { createCmsProvider, MockCmsProvider, DrupalCmsProvider } from '@ripple-next/cms'

// Factory — selects provider based on env
const cms = createCmsProvider({ provider: 'drupal', baseUrl: 'https://tide.example.com' })

// Direct — testing
const cms = new MockCmsProvider()
```

## Tide Content Model

Supports all 8 Tide paragraph types via `TideParagraphMapper`:

accordion, card-collection, timeline, call-to-action, key-dates, embedded-video, content-image, wysiwyg

Drupal-specific code is isolated to exactly 2 files (`drupal.ts` + `tide-paragraph-mapper.ts`) — removable without touching frontend, tests, or API layer.

## Conformance Testing

```typescript
import { cmsConformance } from '@ripple-next/testing/conformance'

cmsConformance(MyCustomCmsProvider)
```

## Related

- [ADR-009: CMS Provider (Drupal)](../../docs/adr/009-cms-provider-drupal.md)
- [ADR-011: CMS Decoupling](../../docs/adr/011-cms-decoupling-pull-out-drupal.md)
