# ADR-017: Upstream Ripple Component Strategy — Port, Own, Selectively Sync

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

The upstream [Ripple 2 design system](https://github.com/dpc-sdp/ripple-framework)
(`@dpc-sdp/ripple-ui-core`, `@dpc-sdp/ripple-ui-forms`) is the official
Victorian Government frontend component library. It provides approximately **46
components** across layout, navigation, content, forms, and interactive patterns
— built on **Vue 3, Nuxt 3, and TypeScript** (the same stack as this repository).

Our `@ripple/ui` package currently has **16 components** (3 atoms, 3 molecules,
2 organisms, and 8 Tide content renderers) with full test coverage,
Storybook stories, and design tokens ported from Brand Victoria standards. There
is currently **zero dependency on upstream** — all components were built from
scratch for this repository.

The question: should we take a runtime dependency on upstream Ripple 2, fork it,
or adopt a hybrid model?

### Upstream Ripple 2 Characteristics

| Aspect | Detail |
|--------|--------|
| Repository | [dpc-sdp/ripple-framework](https://github.com/dpc-sdp/ripple-framework) |
| Stack | Vue 3 + Nuxt 3 + TypeScript + PostCSS |
| Components | ~46 (ripple-ui-core + ripple-ui-forms) |
| Distribution | GitHub Packages (`@dpc-sdp` namespace) — **not npm** |
| Coupling | Tightly coupled to SDP platform and Tide Drupal CMS |
| License | Apache 2.0 |
| Maintenance | Active — latest release Feb 2026 (v2.49.1) |
| Adoption | 50+ Victorian Government websites |

### Component Gap Analysis

| Category | Upstream Ripple 2 | Our @ripple/ui | Gap |
|----------|-------------------|----------------|-----|
| **Atoms** (button, icon, input) | ~5 | 3 | ~2 |
| **Forms** (checkbox, radio, dropdown, date, file, textarea, form alert, option button) | ~10 | 1 (FormInput) | **~9** |
| **Navigation** (breadcrumb, pagination, in-page nav, skip link, primary nav, vertical nav) | ~6 | 1 (Navigation) | **~5** |
| **Content display** (card, timeline, table, tabs, accordion, media, results listing) | ~10 | 8 (Tide renderers) | ~2 |
| **Messaging** (alert, callout, acknowledgement, block quote, campaign banner, contact us) | ~6 | 1 (CTA) | **~5** |
| **Interactive** (chip, tag, related links, page action, social share, search bar, profile) | ~9 | 0 | **~9** |
| **Total** | **~46** | **16** | **~30** |

## Decision

**Adopt a hybrid model: port, own, and selectively sync.**

### 1. Own and Port — `@ripple/ui` Is the Canonical Implementation

All components live in `@ripple/ui` as first-class, owned code. Components are
ported from upstream Ripple 2 designs and patterns but rewritten to follow our
conventions:

- **Provider-pattern aligned** — components are CMS-agnostic, no SDP/Tide
  assumptions baked into templates or props.
- **Our test patterns** — Vue Test Utils + happy-dom + Vitest, not upstream's
  test setup.
- **Our design token system** — CSS custom properties (`--rpl-*`) defined in
  `packages/ui/tokens/`, not upstream's PostCSS pipeline.
- **Our Storybook setup** — Stories follow our conventions with `autodocs` tags.

When porting a component:
1. Reference upstream Ripple 2's Figma designs and component API for visual and
   functional parity.
2. Rewrite the component using our Vue 3 SFC conventions (Composition API,
   `<script setup>`, scoped CSS with `--rpl-*` tokens).
3. Strip any SDP/Tide-specific logic (e.g., hardcoded CMS field mappings,
   SDP-specific footer content, Tide-specific data structures).
4. Add Vue Test Utils tests following existing patterns in `packages/ui/tests/`.
5. Add Storybook story with autodocs and multiple variants.
6. Export from `packages/ui/index.ts` and register in `packages/ui/nuxt.ts`.

### 2. Publish via `@ripple/ui` — Downstream Teams Consume Stable Semver

`@ripple/ui` is published to the private npm registry via the existing changeset
and release workflow. Downstream teams consume stable semver releases — they
never interact with upstream Ripple 2 directly.

This is already in place and requires no changes.

### 3. Selectively Sync — Intentional Ingestion, Not Continuous Dependency

We do **not** take a runtime or build-time dependency on `@dpc-sdp/ripple-ui-core`.
Instead, we periodically review upstream changes and selectively adopt:

**What to sync:**
- Accessibility improvements (WCAG compliance fixes, ARIA pattern updates)
- Design token updates (Brand Victoria colour/typography changes)
- New component patterns that align with our roadmap
- Bug fixes for components we've already ported

**What NOT to sync:**
- SDP/Tide-specific features or coupling
- Upstream architectural changes that conflict with our provider pattern
- Breaking changes that would require cascading updates in our codebase

**Sync cadence:**
- **Quarterly review** — scan upstream releases for relevant changes
- **On-demand** — when a specific upstream improvement is identified during
  development
- **Never automatic** — every sync is a deliberate, reviewed decision

**Sync procedure:**
1. Compare upstream component source against our implementation
2. Extract relevant changes (accessibility, design, bug fixes)
3. Apply as a standard PR with tests and Storybook updates
4. Reference the upstream commit/PR in our commit message for traceability

## Alternatives Considered

### Alternative A: Direct Dependency on `@dpc-sdp/ripple-ui-core`

Take a runtime dependency on upstream's npm packages and use their components
directly.

**Rejected because:**
- **Distribution mismatch** — upstream publishes to GitHub Packages, not npm.
  This adds registry configuration complexity for every developer and CI runner.
- **SDP/Tide coupling** — upstream components contain SDP-specific assumptions
  (footer content, header structure, Tide data mappings) that don't apply to our
  CMS-agnostic architecture.
- **Agent-hostile** — AI agents cannot modify, test, or iterate on components
  they don't own. A dependency creates a black box in the critical rendering
  path.
- **Release cadence mismatch** — upstream releases on their schedule. Breaking
  changes become our emergency.
- **Customisation friction** — overriding upstream behaviour requires CSS hacks,
  slot workarounds, or component wrapping — all fragile patterns.

### Alternative B: Fork `dpc-sdp/ripple-framework`

Fork the entire upstream repository and maintain it as a parallel codebase.

**Rejected because:**
- **Massive initial absorption** — upstream has different conventions, different
  test patterns (Playwright CT vs our Vue Test Utils), different build pipeline
  (PostCSS vs our CSS custom properties), and different Nuxt module patterns.
- **Merge conflict hell** — regular syncs from upstream would produce conflicts
  across conventions, patterns, and architecture decisions.
- **Dual codebase burden** — maintaining a fork means understanding two
  codebases, two sets of conventions, two CI pipelines.
- **History shows forks diverge** — forks that intend to track upstream almost
  always fall behind and eventually become independent projects anyway. Better
  to start clean and sync intentionally.

### Alternative C: Reference Only (No Port)

Keep our 17 components and tell downstream teams to use upstream Ripple 2 for
anything beyond our scope.

**Rejected because:**
- **Incomplete product** — a government digital platform without forms,
  breadcrumbs, or alerts is not viable.
- **Split dependency** — downstream teams would need to configure both our
  private npm registry and GitHub Packages, creating setup friction.
- **Inconsistent patterns** — mixing our provider-pattern components with
  SDP-coupled upstream components in the same application creates architectural
  incoherence.

## Consequences

### Positive

- **Full ownership** — AI agents can iterate on every component without external
  blockers. Fast test loops, conformance suites, and Storybook all work on owned
  code.
- **CMS-agnostic** — ported components work with any CMS backend, not just
  Tide/Drupal. This aligns with the provider pattern ([ADR-003](./003-provider-pattern.md))
  and CMS decoupling ([ADR-011](./011-cms-decoupling-pull-out-drupal.md)).
- **Stable downstream API** — consumers get semver releases from `@ripple/ui`
  with our quality gates (tests, lint, typecheck) enforced.
- **Selective upstream adoption** — we get the best of upstream (accessibility
  improvements, design updates) without the worst (SDP coupling, breaking
  changes).
- **Single registry** — downstream teams only need private npm, not GitHub
  Packages.

### Negative

- **Maintenance burden** — every ported component needs ongoing maintenance
  (bug fixes, accessibility updates, design token alignment).
- **Sync effort** — quarterly upstream reviews require someone to evaluate and
  apply relevant changes.
- **Potential divergence** — over time, our implementations may drift
  significantly from upstream, making sync harder.
- **Initial porting effort** — ~29 components to evaluate and selectively port,
  estimated across multiple sprints.

### Neutral

- The Apache 2.0 license on upstream Ripple 2 permits porting component designs
  and patterns without legal constraint.
- Upstream Ripple 2's Figma designs remain the primary visual reference for
  Brand Victoria compliance regardless of implementation ownership.

## Component Port Priority

Porting should follow this priority order, based on government website needs:

| Priority | Category | Components | Rationale |
|----------|----------|------------|-----------|
| **P1** | Forms | Checkbox, Radio, Dropdown, DateInput, Textarea, FileUpload, FormAlert | Government sites are form-heavy (applications, feedback, registrations) |
| **P2** | Navigation | Breadcrumb, Pagination, InPageNav, SkipLink | Essential UX and accessibility (WCAG 2.4.1 skip nav) |
| **P3** | Messaging | Alert, Callout, Acknowledgement, BlockQuote | Status communication and Indigenous acknowledgement |
| **P4** | Interactive | Tabs, SearchBar, Tag, Chip, RelatedLinks | Common content patterns |
| **P5** | Content | Table, StatisticsGrid, CategoryGrid, ResultsListing, Profile | Data display and listing patterns |
| **P6** | Media | MediaGallery, MediaFullscreen, Carousel | Rich media (lower priority — RN-021 covers some) |

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — components must be
  CMS-agnostic, aligning with the provider pattern
- [ADR-009: CMS Provider for Drupal/Tide](./009-cms-provider-drupal.md) — Tide
  content types drive content renderer components
- [ADR-011: CMS Decoupling](./011-cms-decoupling-pull-out-drupal.md) — UI
  components must not contain CMS-specific logic
- [RN-021](../product-roadmap/README.md#rn-021-media-gallery--document-download-components) —
  media components overlap with P6 port priority
- [Upstream Ripple 2](https://github.com/dpc-sdp/ripple-framework) — source of
  designs and patterns for porting
- [Ripple Design System](https://www.ripple.sdp.vic.gov.au/) — canonical design
  reference for Brand Victoria
