# @ripple-next/ui

Vue 3 component library for Victorian government digital products. 44 components following the Ripple design system, WCAG 2.1 AA compliant.

## Install

```bash
pnpm add @ripple-next/ui
```

## Nuxt Integration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@ripple-next/ui'],
})
```

All components are auto-imported globally via Nuxt module.

## Components

### Atoms (19)

**Form:** `RplButton`, `RplFormInput`, `RplCheckbox`, `RplRadio`, `RplDropdown`, `RplDateInput`, `RplTextarea`, `RplFileUpload`, `RplFormAlert`, `RplOptionButton`

**Content:** `RplIcon`, `RplAlert`, `RplCallout`, `RplAcknowledgement`, `RplBlockQuote`

**Navigation:** `RplBreadcrumb`, `RplSkipLink`

**Data:** `RplTag`, `RplChip`

### Molecules (14)

`RplCard`, `RplHeroHeader`, `RplNavigation`, `RplPagination`, `RplInPageNavigation`, `RplTabs`, `RplSearchBar`, `RplRelatedLinks`, `RplTable`, `RplStatisticsGrid`, `RplCategoryGrid`, `RplResultsListing`, `RplDetailList`, `RplMediaGallery`, `RplDocumentDownload`

### Organisms (2)

`RplHeader`, `RplFooter`

### Tide Content Sections (8)

Renderers for Drupal/Tide paragraph types:

`RplAccordion`, `RplCardCollection`, `RplTimeline`, `RplCallToAction`, `RplKeyDates`, `RplContentImage`, `RplEmbeddedVideo`, `RplContentWysiwyg`

## Composables

```typescript
import { useRplTheme, useRplFormValidation, rplValidationRules } from '@ripple-next/ui'

const { validate, errors } = useRplFormValidation({
  email: [rplValidationRules.required(), rplValidationRules.email()],
})
```

## Design Tokens

CSS custom properties for colors, spacing, and typography are registered globally via the Nuxt module.

## Storybook

```bash
pnpm --filter @ripple-next/ui storybook
```

All components have stories with autodocs and `@storybook/addon-a11y` integration.

## Related

- [ADR-017: Upstream Ripple Component Strategy](../../docs/adr/017-upstream-ripple-component-strategy.md)
- [Accessibility guide](../../docs/accessibility.md)
