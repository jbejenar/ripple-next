# ADR-011: CMS Decoupling — "Pull Out Drupal" Architecture

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** Drupal/Tide must be supported for existing government sites, but must be removable without touching the frontend, tests, or API layer.

## Context

Ripple Next supports Drupal/Tide as the primary CMS backend for Victorian
government websites. However, stakeholders require the ability to "pull out"
Drupal entirely — for new deployments that use a different CMS, or if the
organisation decides to migrate away from Drupal.

ADR-009 established the CMS provider pattern. This ADR extends it with:

1. An explicit **decoupling boundary** — exactly two files contain Drupal knowledge
2. A **provider factory** with dynamic imports for tree-shakeable Drupal code
3. Full **paragraph-to-section mapping** to eliminate the last Drupal coupling point
4. A concrete **removal procedure** documented for future teams

## Decision

### Decoupling Boundary

All Drupal/Tide-specific code is isolated in exactly two files:

```
packages/cms/providers/
├── drupal.ts                 # DrupalCmsProvider — JSON:API client
└── tide-paragraph-mapper.ts  # Tide paragraph → PageSection mapping
```

These files are the ONLY places that import or reference Drupal concepts. Everything
else — the `CmsProvider` interface, `MockCmsProvider`, UI components, composables,
API routes, conformance tests, and Zod schemas — is CMS-agnostic.

### Provider Factory with Dynamic Imports

```typescript
// packages/cms/factory.ts
export async function createCmsProvider(options) {
  switch (options.type) {
    case 'drupal': {
      const { DrupalCmsProvider } = await import('./providers/drupal')
      return new DrupalCmsProvider(options)
    }
    case 'mock': {
      const { MockCmsProvider } = await import('./providers/mock')
      return new MockCmsProvider()
    }
  }
}
```

Dynamic imports ensure that Drupal-specific code is only loaded when the provider
type is `'drupal'`. In production builds without Drupal, the bundler can tree-shake
the entire Drupal provider and its mapper.

### Full Paragraph Mapping

The `tide-paragraph-mapper.ts` module maps all Tide paragraph types to the
platform-agnostic `PageSection` discriminated union:

| Tide Paragraph Type | PageSection Type |
|---------------------|------------------|
| `paragraph--wysiwyg` | `wysiwyg` |
| `paragraph--basic_text` | `wysiwyg` |
| `paragraph--accordion` | `accordion` |
| `paragraph--card_collection` | `card-collection` |
| `paragraph--timeline` | `timeline` |
| `paragraph--call_to_action` | `call-to-action` |
| `paragraph--key_dates` | `key-dates` |
| `paragraph--embedded_video` | `embedded-video` |
| `paragraph--content_image` | `image` |

Unknown paragraph types are skipped gracefully. The mapper falls back to the
node's `body` field when no paragraph references exist.

### Removal Procedure

To completely remove Drupal from Ripple Next:

1. Delete `packages/cms/providers/drupal.ts`
2. Delete `packages/cms/providers/tide-paragraph-mapper.ts`
3. Remove the `'drupal'` case from `packages/cms/factory.ts`
4. Remove `DrupalCmsProvider` export from `packages/cms/index.ts`
5. Remove `NUXT_CMS_BASE_URL`, `NUXT_CMS_SITE_ID`, `NUXT_CMS_AUTH_USER`,
   `NUXT_CMS_AUTH_PASSWORD` from `.env.example`
6. Update `apps/web/server/utils/cms-provider.ts` to remove Drupal option
7. Delete `packages/cms/tests/drupal.test.ts`

**Nothing else changes.** All tests pass. All UI components work. All API routes
work. The frontend renders content from whatever CMS provider is configured.

### Adding a New CMS Backend

To add support for a new CMS (e.g., Contentful, Strapi, WordPress):

1. Create `packages/cms/providers/{cms-name}.ts` implementing `CmsProvider`
2. Add the new type to `packages/cms/factory.ts`
3. Run the conformance suite: `cmsConformance({ name: '...', factory: ... })`
4. All 18+ conformance tests must pass
5. No changes needed to UI, composables, API routes, or tests

## Rationale

### Why isolate to exactly two files

Making the boundary explicit (not scattered) means:
- AI agents can understand the dependency surface in seconds
- Code reviews catch Drupal coupling immediately
- The removal procedure is mechanical, not analytical

### Why dynamic imports in the factory

Static imports of DrupalCmsProvider would pull Drupal code into every bundle,
even when using MockCmsProvider. Dynamic imports allow:
- Tree-shaking in environments that don't use Drupal
- Faster cold starts in Lambda (less code to parse)
- Clear separation of concern at the module level

### Why full paragraph mapping matters

The MVP body-only approach meant DrupalCmsProvider returned flat HTML instead of
structured sections. This forced UI components to be unused when connected to
Drupal, defeating the purpose of the Tide-compatible component library. Full
paragraph mapping closes this gap.

### Alternatives Considered

| Option | Why not |
|--------|---------|
| **Adapter layer between Drupal and CmsProvider** | Over-engineering; the provider IS the adapter |
| **GraphQL abstraction over all CMS backends** | Adds complexity without benefit; JSON:API is sufficient for Drupal |
| **Compile-time feature flags for Drupal** | Build tooling overhead; dynamic imports achieve the same result more simply |
| **Separate repository for Drupal integration** | Fragments the codebase; harder to keep in sync with provider interface changes |

## Consequences

- Drupal/Tide code isolated to 2 files in `packages/cms/providers/`
- `createCmsProvider()` factory exported from `@ripple-next/cms`
- Dynamic imports make Drupal code tree-shakeable
- Full paragraph-to-section mapping for all 8 Tide paragraph types
- DrupalCmsProvider unit tests with JSON:API fixture data (no live Drupal needed)
- Documented removal procedure for pulling out Drupal
- Documented addition procedure for new CMS backends
- AI agents can modify CMS behavior with confidence about the blast radius

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — the foundational pattern
- [ADR-009: CMS Provider for Drupal/Tide](./009-cms-provider-drupal.md) — initial CMS integration
- [Provider Pattern Guide](../provider-pattern.md) — implementation details
- [Product Roadmap](../product-roadmap/) — CMS integration roadmap items
