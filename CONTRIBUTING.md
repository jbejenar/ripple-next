# Contributing to Ripple Next

## Getting Started

```bash
pnpm bootstrap    # install + doctor + validate
pnpm dev          # start development server
```

See [AGENTS.md](./AGENTS.md) for full architecture and conventions.

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes following the conventions in AGENTS.md
3. Run quality gates: `pnpm verify`
4. If you changed a published package's API: `pnpm changeset`
5. Open a pull request — CI runs automatically

## Upstream Ripple Sync Procedure

This project ports components from the upstream [Ripple design system](https://github.com/dpc-sdp/ripple)
(`@dpc-sdp/ripple-ui-core`, `@dpc-sdp/ripple-ui-forms`) but does **not** take a
runtime dependency on it. See [ADR-017](docs/adr/017-upstream-ripple-component-strategy.md)
for the full rationale.

### Quarterly Review Process

Every quarter (March, June, September, December), review upstream releases:

1. **Identify new releases** — check the [upstream releases page](https://github.com/dpc-sdp/ripple/releases)
   for changes since the last tracked version in `docs/readiness.json` (`upstreamRipple.lastReviewedVersion`).

2. **Run the sync checklist** — for each upstream release, evaluate against the
   checklist below.

3. **Apply relevant changes** — create a PR for each adopted change with:
   - Reference to the upstream commit/PR in the commit message
   - Updated tests and Storybook stories
   - No SDP/Tide-specific code

4. **Update tracking** — update `docs/readiness.json` with:
   - `upstreamRipple.lastReviewedVersion` — the latest version reviewed
   - `upstreamRipple.lastReviewDate` — the date of the review

### Sync Checklist

For each upstream release, evaluate these categories:

#### Always Sync
- [ ] **Accessibility fixes** — WCAG compliance improvements, ARIA pattern updates,
      keyboard navigation fixes, screen reader improvements
- [ ] **Design token updates** — Brand Victoria colour changes, typography updates,
      spacing adjustments from the official design system
- [ ] **Bug fixes for ported components** — fixes for components already in `@ripple-next/ui`

#### Sync If Aligned with Roadmap
- [ ] **New component patterns** — components on our port priority list
      (see [ADR-017 Component Port Priority](docs/adr/017-upstream-ripple-component-strategy.md#component-port-priority))
- [ ] **Performance improvements** — rendering optimizations, bundle size reductions
- [ ] **Responsive design updates** — breakpoint changes, mobile-first improvements

#### Never Sync
- [ ] SDP/Tide-specific features or Drupal CMS coupling
- [ ] Upstream architectural changes that conflict with our provider pattern
- [ ] Breaking changes that would require cascading updates across consumers
- [ ] Dependencies on `@dpc-sdp/*` packages or GitHub Packages registry
- [ ] Upstream test infrastructure changes (they use Playwright CT; we use Vue Test Utils)

### Porting a New Component

When porting a component from upstream:

```bash
# 1. Scaffold using our generator
pnpm generate:component <Name> --tier=<atoms|molecules|organisms>

# 2. Follow the runbook for complete procedure
pnpm runbook add-new-component
```

Key rules for porting:
- Rewrite using our Vue 3 SFC conventions (`<script setup lang="ts">`)
- Use our design token system (`--rpl-*` CSS custom properties)
- Strip all SDP/Tide-specific logic
- Add Vue Test Utils tests (not upstream's Playwright CT)
- Add Storybook story with autodocs
- Reference upstream Ripple's Figma designs for visual parity

See [ADR-017](docs/adr/017-upstream-ripple-component-strategy.md) for detailed
porting conventions and the full component gap analysis.
