# Remediation Backlog

**Date:** 2026-03-06
**Total findings:** 166 raw, 133 de-duplicated remediation items
**Priority order:** CRITICAL > HIGH > MEDIUM > LOW, sequenced by dependency chain

---

## CRITICAL (12 findings)

### [RB-001] [CRITICAL] [M] — @ripple-next/ui has no type declarations

**Source:** downstream-auditor | **File:** `packages/ui/tsconfig.json`, `packages/ui/package.json`
**Root Cause:** `declaration: false` in tsconfig.json; vite build produces only .js; publishConfig.exports has no `types` condition
**Impact:** Every downstream consumer gets zero TypeScript type safety for 50+ components, composables, and tokens. All imports require `// @ts-ignore`.
**Remediation:**
1. Add `vue-tsc` or `vite-plugin-dts` to generate .d.ts files during build
2. Set `declaration: true` in tsconfig.json (or use separate declaration build)
3. Add `"types"` condition to each entry in publishConfig.exports
4. Verify `.d.ts` files generated for all exported components
**Acceptance Criteria:**
- [ ] `pnpm build` generates .d.ts files in dist/
- [ ] Consumer TypeScript project resolves types without error
- [ ] `publishConfig.exports["."].types` points to valid .d.ts
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-002] [CRITICAL] [XS] — Consumer guide .npmrc has wrong package scope

**Source:** downstream-auditor | **File:** `docs/consumer-app-guide.md:58`
**Root Cause:** Documentation error — `@ripple:registry` should be `@ripple-next:registry`
**Impact:** First step of downstream adoption fails. Every `pnpm install` returns 404.
**Remediation:**
1. Change `@ripple:registry=https://npm.pkg.github.com` to `@ripple-next:registry=https://npm.pkg.github.com`
**Acceptance Criteria:**
- [ ] Scope matches actual package names (`@ripple-next/*`)
**Owner:** Documentation owner
**Dependencies:** None

---

### [RB-003] [CRITICAL] [M] — @ripple-next/testing is unpublishable

**Source:** downstream-auditor | **File:** `packages/testing/package.json`
**Root Cause:** No publishConfig, no exports map, no files field, no build step. Main points to raw .ts.
**Impact:** Cannot be consumed by downstream repos. All conformance test examples in provider READMEs are broken.
**Remediation:**
1. Add build step (tsup or unbuild) to compile .ts to .js + .d.ts
2. Add publishConfig with compiled entry points
3. Add exports map with subpaths: `"."`, `"./conformance"`, `"./helpers"`, `"./factories"`, `"./mocks"`
4. Add `files: ["dist"]`
5. Export `secretsConformance` from `conformance/index.ts`
**Acceptance Criteria:**
- [ ] `pnpm pack` produces installable tarball
- [ ] `import { queueConformance } from '@ripple-next/testing/conformance'` resolves
- [ ] `import { secretsConformance } from '@ripple-next/testing/conformance'` resolves
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-004] [CRITICAL] [S] — RplMediaEmbed fullscreen dialog has no focus trap

**Source:** a11y-auditor | **File:** `packages/ui/components/molecules/RplMediaEmbed.vue:140-156`
**Root Cause:** Uses `<dialog :open>` instead of `.showModal()`. No focus trap, no Escape handler, no focus management.
**Impact:** Keyboard users cannot escape the fullscreen overlay. WCAG 2.1.2 violation.
**Remediation:**
1. Switch from `<dialog :open>` to using `.showModal()` API (provides built-in focus trap + Escape)
2. Or implement manual focus trapping matching RplMediaFullscreen pattern
3. Move focus into dialog on open, return focus to trigger on close
**Acceptance Criteria:**
- [ ] Tab key cycles within dialog only
- [ ] Escape key closes dialog
- [ ] Focus returns to trigger element on close
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-005] [CRITICAL] [S] — 5 form components use `:focus` instead of `:focus-visible`

**Source:** a11y-auditor | **File:** RplFormInput, RplTextarea, RplDropdown, RplDateInput, RplSkipLink
**Root Cause:** `:focus { outline: none; }` removes native focus ring for ALL focus modes
**Impact:** WCAG 2.4.7 violation. Focus indicator may fail in high-contrast mode.
**Remediation:**
1. Replace `:focus { outline: none; ... }` with `:focus-visible { ... }` in all 5 components
**Acceptance Criteria:**
- [ ] Keyboard focus shows custom ring
- [ ] Mouse click does not show ring (browser default behavior with `:focus-visible`)
- [ ] All 5 components updated
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-006] [CRITICAL] [S] — packages/queue/consumer.ts completely untested

**Source:** test-auditor | **File:** `packages/queue/consumer.ts`
**Root Cause:** Consumer with retry logic, DLQ routing, and error handling has zero tests
**Impact:** Message processing could silently fail. Tier 1 package.
**Remediation:**
1. Add `packages/queue/tests/consumer.test.ts`
2. Test: happy path, retry exhaustion, handler errors, empty queue, DLQ routing
**Acceptance Criteria:**
- [ ] Consumer tests pass
- [ ] Retry logic verified
- [ ] Error handling verified
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-007] [CRITICAL] [S] — SQS queue provider completely untested

**Source:** test-auditor | **File:** `packages/queue/providers/sqs.ts`
**Root Cause:** Production queue provider exported but never tested
**Impact:** SQS provider could have broken serialization or error handling. Tier 1 package.
**Remediation:**
1. Add `packages/queue/tests/sqs.test.ts` with `vi.mock('@aws-sdk/client-sqs')`
2. Run queueConformance against mocked SQS provider
**Acceptance Criteria:**
- [ ] SQS provider tests pass with mocked SDK
- [ ] Conformance suite passes
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-008] [CRITICAL] [S] — BullMQ queue provider completely untested

**Source:** test-auditor | **File:** `packages/queue/providers/bullmq.ts`
**Root Cause:** Local dev queue provider exported but never tested
**Impact:** BullMQ provider could fail silently. Tier 1 package.
**Remediation:**
1. Add `packages/queue/tests/bullmq.test.ts` with mocked BullMQ dependency
**Acceptance Criteria:**
- [ ] BullMQ provider tests pass
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-009] [CRITICAL] [S] — SES email provider completely untested

**Source:** test-auditor | **File:** `packages/email/providers/ses.ts`
**Root Cause:** Production email provider exported but never tested
**Impact:** Production email delivery could fail with no safety net. Tier 2 package.
**Remediation:**
1. Add `packages/email/tests/ses.test.ts` with `vi.mock('@aws-sdk/client-ses')`
**Acceptance Criteria:**
- [ ] SES provider tests pass with mocked SDK
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-010] [CRITICAL] [S] — SessionRepository has zero tests

**Source:** test-auditor | **File:** `packages/db/repositories/session.repository.ts`
**Root Cause:** Auth-critical repository with 5 methods, zero test coverage
**Impact:** Session management (create, find, delete, cleanup) could silently break. Tier 1 package.
**Remediation:**
1. Add `packages/db/tests/integration/session.repository.integration.test.ts`
2. Test all 5 methods with testcontainers PostgreSQL
**Acceptance Criteria:**
- [ ] All 5 repository methods tested
- [ ] Integration test gated behind Docker availability
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-011] [CRITICAL] [S] — packages/shared/utils completely untested

**Source:** test-auditor | **File:** `packages/shared/utils/index.ts`
**Root Cause:** Utility functions (slugify, truncate, formatDate, objectKeys, sleep) used across 14 packages have zero tests
**Impact:** Utility changes could silently break consuming packages
**Remediation:**
1. Add `packages/shared/tests/utils.test.ts` covering edge cases for each function
**Acceptance Criteria:**
- [ ] All utility functions tested with edge cases (empty strings, unicode, etc.)
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-012] [CRITICAL] [S] — 4 packages have no vitest workspace entry or coverage thresholds

**Source:** test-auditor | **File:** `vitest.workspace.ts`
**Root Cause:** shared, config, cli, secrets not configured in vitest workspace
**Impact:** Tests may not run as part of `pnpm test`. No coverage enforcement.
**Remediation:**
1. Add workspace entries for shared (Tier 3), config (Tier 2), cli (Tier 3), secrets (Tier 1)
2. Set appropriate coverage thresholds per CLAUDE.md tiers
**Acceptance Criteria:**
- [ ] All 4 packages in vitest.workspace.ts
- [ ] Coverage thresholds match CLAUDE.md tiers
**Owner:** Platform developer
**Dependencies:** None

---

## HIGH (39 findings — showing top 20, remainder in full audit report)

### [RB-013] [HIGH] [S] — All GitHub Actions pinned to mutable tags

**Source:** infra-security-auditor | **File:** All `.github/workflows/*.yml`
**Root Cause:** Actions use `@v4`, `@v3` etc. instead of SHA hashes
**Impact:** Supply chain attack risk. Compromised upstream action runs in every workflow.
**Remediation:**
1. Pin every action to full SHA hash (e.g., `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.7`)
2. Add Dependabot or step-security/harden-runner for auto-updates
**Acceptance Criteria:**
- [ ] All `uses:` directives reference SHA hashes
- [ ] Tag version noted in comment
**Owner:** DevOps
**Dependencies:** None

---

### [RB-014] [HIGH] [M] — PowerUserAccess on deploy role

**Source:** infra-security-auditor | **File:** `infra/github-oidc.ts:127`
**Root Cause:** IAM role uses AWS managed PowerUserAccess policy
**Impact:** Compromised CI workflow has near-admin AWS access. Government platform security concern.
**Remediation:**
1. Create custom IAM policy scoped to SST deploy services (Lambda, S3, DynamoDB, SQS, etc.)
2. Remove PowerUserAccess attachment
**Acceptance Criteria:**
- [ ] No `*` actions in IAM policy
- [ ] Policy scoped to required services only
**Owner:** DevOps / Platform
**Dependencies:** None

---

### [RB-015] [HIGH] [XS] — vue is a regular dependency in @ripple-next/ui

**Source:** downstream-auditor | **File:** `packages/ui/package.json`
**Root Cause:** `vue` listed in `dependencies` instead of `peerDependencies`
**Impact:** Consumers get duplicate Vue instances. Reactivity, provide/inject, teleport all break.
**Remediation:**
1. Move `vue` from `dependencies` to `peerDependencies`
2. Add `peerDependenciesMeta: { vue: { optional: false } }`
**Acceptance Criteria:**
- [ ] `vue` in peerDependencies
- [ ] Consumer `pnpm ls vue` shows single instance
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-016] [HIGH] [S] — RplMediaGallery lightbox has no focus trap

**Source:** a11y-auditor | **File:** `packages/ui/components/molecules/RplMediaGallery.vue:91-152`
**Root Cause:** Lightbox overlay handles keys but doesn't trap focus
**Impact:** Keyboard users can Tab behind the overlay. WCAG 2.1.2 violation.
**Remediation:**
1. Implement focus trap (copy pattern from RplMediaFullscreen)
2. Move focus to close button on open
3. Return focus to trigger on close
**Acceptance Criteria:**
- [ ] Focus trapped within lightbox
- [ ] Focus management on open/close
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-017] [HIGH] [S] — 20 components ignore prefers-reduced-motion

**Source:** a11y-auditor | **File:** 20 components with CSS `transition` properties
**Root Cause:** Only 2 of 22 animated components include `@media (prefers-reduced-motion: reduce)`
**Impact:** Government a11y requirement. WCAG 2.3.3.
**Remediation:**
1. Add global `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }` to base styles
2. Or add per-component overrides
**Acceptance Criteria:**
- [ ] Animations suppressed when prefers-reduced-motion is set
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-018] [HIGH] [S] — RplButton has no :focus-visible style

**Source:** a11y-auditor | **File:** `packages/ui/components/atoms/RplButton.vue`
**Root Cause:** No focus styles defined at all. Relies on browser default.
**Impact:** Focus indicator may be invisible on primary-colored backgrounds. WCAG 2.4.7.
**Remediation:**
1. Add `.rpl-button:focus-visible { outline: 2px solid var(--rpl-clr-primary); outline-offset: 2px; }`
**Acceptance Criteria:**
- [ ] Visible focus ring on keyboard focus
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-019] [HIGH] [XS] — @ripple-next/ui missing sideEffects field

**Source:** downstream-auditor | **File:** All `packages/*/package.json`
**Root Cause:** No `"sideEffects": false` declared in any package
**Impact:** Bundlers cannot tree-shake unused exports. Full library bundled for single import.
**Remediation:**
1. Add `"sideEffects": false` to all 14 package.json files
**Acceptance Criteria:**
- [ ] All packages declare sideEffects
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-020] [HIGH] [XS] — @ripple-next/db leaks Drizzle internals via export *

**Source:** downstream-auditor | **File:** `packages/db/index.ts`
**Root Cause:** `export * from './schema'` exposes raw pgTable objects
**Impact:** Schema changes become breaking changes for consumers. Internal types leaked.
**Remediation:**
1. Replace `export *` with explicit named exports (types only: User, NewUser, Project, etc.)
2. Keep table objects internal, accessible only through repositories
**Acceptance Criteria:**
- [ ] No raw table objects in public API
- [ ] All needed types explicitly exported
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-021] [HIGH] [S] — 5 non-null assertions in production code risk runtime crashes

**Source:** code-auditor | **Files:** auth-provider.ts, s3.ts, user.repository.ts
**Root Cause:** `!.` assertions after nullable operations without null guards
**Impact:** Runtime crashes if DB returns null or S3 response is empty
**Remediation:**
1. Add null checks with appropriate error throws for each instance
**Acceptance Criteria:**
- [ ] All 5 non-null assertions replaced with explicit null guards
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-022] [HIGH] [S] — ADRs 024, 025, 026 marked "Proposed" but fully implemented

**Source:** doc-auditor | **File:** `docs/adr/README.md`
**Root Cause:** Status never updated after implementation
**Impact:** Developers/agents may think these features are still proposals
**Remediation:**
1. Update status to "Accepted" in ADR index and individual ADR files
**Acceptance Criteria:**
- [ ] All three ADRs show "Accepted" status
**Owner:** Documentation owner
**Dependencies:** None

---

### [RB-023] [HIGH] [S] — Package READMEs document non-functional import paths

**Source:** downstream-auditor | **File:** Multiple package README.md files
**Root Cause:** Document `@ripple-next/testing/conformance` but no exports map entry exists
**Impact:** Every conformance test example is broken
**Remediation:**
1. Add exports map entries to @ripple-next/testing for subpaths
2. Or update README examples to use valid import paths
**Acceptance Criteria:**
- [ ] All documented import paths resolve
**Owner:** Platform developer
**Dependencies:** RB-003

---

### [RB-024] [HIGH] [S] — S3, MinIO storage providers untested

**Source:** test-auditor | **Files:** `packages/storage/providers/s3.ts`, `minio.ts`
**Root Cause:** Production storage providers never tested
**Impact:** File upload/download could fail silently in production
**Remediation:**
1. Add test files with mocked AWS SDK
**Acceptance Criteria:**
- [ ] S3 provider tests pass
- [ ] MinIO provider tests pass
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-025] [HIGH] [S] — AWS, Env, Chain secrets providers untested

**Source:** test-auditor | **Files:** `packages/secrets/providers/aws.ts`, `env.ts`, `chain.ts`
**Root Cause:** Three provider implementations with zero tests
**Impact:** Secrets resolution in CI/production could fail
**Remediation:**
1. Add test files for each provider
**Acceptance Criteria:**
- [ ] All 3 providers tested
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-026] [HIGH] [M] — Hardcoded hex colours across 16 UI components (systemic)

**Source:** code-auditor | **Files:** 16 components, 54 instances
**Root Cause:** Colours not using CSS custom properties / design tokens
**Impact:** Theme customization impossible. Inconsistent colour usage.
**Remediation:**
1. Define CSS custom properties for all used colours in tokens
2. Replace all hardcoded hex values with `var(--rpl-clr-*)` references
**Acceptance Criteria:**
- [ ] Zero hardcoded hex colours in component styles
- [ ] All colours reference design tokens
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-027] [HIGH] [S] — v-html content has no accessibility guarantees

**Source:** a11y-auditor | **Files:** RplContentWysiwyg, RplAccordion, RplTimeline
**Root Cause:** Raw CMS HTML rendered without sanitization or a11y enforcement
**Impact:** Images may lack alt text, tables may lack headers, links may lack descriptive text
**Remediation:**
1. Document CMS content accessibility requirements
2. Consider implementing a content sanitizer/transformer
**Acceptance Criteria:**
- [ ] CMS integration docs include a11y requirements for content
**Owner:** Frontend developer + CMS integration
**Dependencies:** None

---

### [RB-028] [HIGH] [XS] — @nuxt/kit as regular dependency in @ripple-next/ui

**Source:** downstream-auditor | **File:** `packages/ui/package.json`
**Root Cause:** @nuxt/kit in dependencies, only needed for nuxt.ts entry point
**Impact:** Non-Nuxt consumers get large unnecessary dependency tree
**Remediation:**
1. Move @nuxt/kit to peerDependencies with optional: true
**Acceptance Criteria:**
- [ ] @nuxt/kit in peerDependencies with optional flag
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-029] [HIGH] [S] — 4 untested service handlers

**Source:** test-auditor | **Files:** cleanup, reports, user-created, websocket
**Root Cause:** Service handlers have no test files
**Impact:** Service layer changes go undetected
**Remediation:**
1. Add test files for each handler with mock providers
**Acceptance Criteria:**
- [ ] All 4 handlers have test files
**Owner:** Platform developer
**Dependencies:** None

---

### [RB-030] [HIGH] [S] — 3 untested app composables + middleware

**Source:** test-auditor | **Files:** useAuth, useCms, useNavigation, auth middleware
**Root Cause:** App-level code has no unit tests
**Impact:** Auth flows, CMS fetching, navigation could break without detection
**Remediation:**
1. Add unit tests for each composable and the auth middleware
**Acceptance Criteria:**
- [ ] All 3 composables and middleware tested
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-031] [HIGH] [S] — RplCard and RplNavigationList sublinks missing focus-visible

**Source:** a11y-auditor | **Files:** RplCard.vue, RplNavigationList.vue
**Root Cause:** Interactive link elements have no visible focus indicator
**Impact:** WCAG 2.4.7 violation
**Remediation:**
1. Add `:focus-visible` styles to both components
**Acceptance Criteria:**
- [ ] Visible focus ring on keyboard navigation
**Owner:** Frontend developer
**Dependencies:** None

---

### [RB-032] [HIGH] [XS] — @ripple-next/ui missing files field — publishes entire source

**Source:** downstream-auditor | **File:** `packages/ui/package.json`
**Root Cause:** No `files` field in package.json
**Impact:** Tests, stories, config files included in published package. Bloat + source exposure.
**Remediation:**
1. Add `"files": ["dist", "README.md"]`
**Acceptance Criteria:**
- [ ] `pnpm pack` produces package without test/story files
**Owner:** Frontend developer
**Dependencies:** None

---

## MEDIUM (55 findings — grouped by systemic pattern)

### Systemic: 9 form components missing aria-required [RB-033] [M] [S]
Add `:aria-required="required"` to RplFormInput, RplTextarea, RplDropdown, RplCheckbox, RplRadio, RplOptionButton, RplDateInput, RplFileUpload, RplSearchBar.

### Systemic: ~130 hardcoded px values without tokens [RB-034] [M] [M]
Define design tokens for border-radius, max-width, outline-offset, breakpoints. Replace hardcoded values.

### Systemic: ~30 raw font-size values without tokens [RB-035] [M] [M]
Replace with `var(--rpl-type-size-*)` matching existing pattern.

### Systemic: Unvalidated API query params [RB-036] [M] [S]
Add Zod validation to CMS API routes (pages.get.ts, etc.) before passing to providers.

### Systemic: Missing return types on composables [RB-037] [M] [S]
Add explicit return types to useRplTheme, useRplFormValidation, useCms, useAuth, useNavigation.

### Doc staleness: Error taxonomy counts [RB-038] [M] [XS]
Update platform-capabilities.md (68+ → 94), error-taxonomy.json (85 → 94).

### Doc staleness: Subsystem counts [RB-039] [M] [XS]
Update roadmap README (16 → 18 subsystems), maturity distribution, CMS maturity level.

### Doc staleness: Package listings [RB-040] [M] [XS]
Add config, secrets, cli to README.md structure section.

### Doc staleness: ADR count [RB-041] [M] [XS]
Update architecture.md (26 → 28 ADRs).

### A11Y: Accordion missing aria-labelledby [RB-042] [M] [S]
Add id to accordion buttons, add aria-labelledby to panels.

### A11Y: Form fieldset missing legend [RB-043] [M] [S]
Add `<legend>` to RplForm fieldset.

### A11Y: Non-semantic lists in KeyDates/Timeline [RB-044] [M] [S]
Replace styled divs with `<ol>/<li>` or `<dl>/<dt>/<dd>`.

### A11Y: Missing landmarks in CampaignBanner/ContactUs [RB-045] [M] [S]
Wrap in `<section>` with aria-label.

### A11Y: Textarea counter not announced [RB-046] [M] [S]
Add `role="status"` and `aria-live="polite"` to counter.

### A11Y: No axe-core in component tests [RB-047] [M] [M]
Install vitest-axe, add toHaveNoViolations() to component tests.

### S3 CORS wildcard [RB-048] [M] [XS]
Restrict allowOrigins to actual domains in sst.config.ts.

### Stub handlers without tickets [RB-049] [M] [XS]
Add TODO with ticket reference to cleanup, reports, user-created handlers.

### console.error in non-exempt file [RB-050] [M] [XS]
Add packages/queue/consumer.ts to lint exempt list or use logger.

### drizzle-orm should be peerDependency [RB-051] [M] [XS]
Move drizzle-orm from dependencies to peerDependencies in @ripple-next/db.

### MockProviders missing secrets [RB-052] [M] [S]
Add MemorySecretsProvider to createMockProviders() in packages/testing.

### Validation schemas untested [RB-053] [M] [M]
Add tests for user, project, and CMS validation schemas.

### CMS API routes untested [RB-054] [M] [M]
Add unit tests for 6 CMS API routes and 3 auth routes in apps/web.

### Generator command mismatch [RB-055] [M] [XS]
Fix platform-capabilities.md: `generate:api-endpoint` → `generate:endpoint`.

### e2e.yml missing concurrency group [RB-056] [M] [XS]
Add concurrency group matching ci.yml pattern.

### DATABASE_URL non-null assertion [RB-057] [M] [XS]
Replace `process.env.DATABASE_URL!` with validated access in drizzle.config.ts.

### shared export * fragility [RB-058] [M] [S]
Replace with explicit named exports for API stability.

### A11Y: HeroHeader background image alt [RB-059] [M] [S]
Add backgroundImageAlt prop or mark decorative.

### A11Y: Profile avatar hidden [RB-060] [M] [XS]
Review aria-hidden on avatar container.

### CLI command tests [RB-061] [M] [M]
Add behavioral tests for CLI commands beyond shape-only tests.

### apps/web missing coverage thresholds [RB-062] [M] [XS]
Add Tier 3 thresholds to apps/web/vitest.config.ts.

---

## LOW (60 findings — summarized)

- 16 acceptable type assertions in DOM event handlers (CODE-016–024)
- Acceptable `Object.keys()` casts (CODE-015)
- Acceptable process.env cast (CODE-006)
- Console statements in exempt files (CODE-063–070)
- Internal component not exported (RplNavigationList — intentional)
- Test isolation nits (process.env mutation, vi.doMock patterns)
- BullMQ in devDependencies warning
- Testing package dependency bloat
- Various doc/count precision issues
- NAT instance single point of failure
- SMTP secure: false for dev
- Dual deploy trigger for staging
- RplSearchBar redundant aria-label
- RplOptionButton :has() fallback
- RplHeader logo alt text
- allowHttpRequests option without production guard
- Health endpoint raw SQL (SELECT 1)

---

## Remediation Effort Summary

| Effort | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| XS (< 30 min) | 1 | 5 | 14 | 8 | 28 |
| S (< 2 hrs) | 9 | 14 | 13 | 9 | 45 |
| M (< 1 day) | 2 | 2 | 7 | 2 | 13 |
| **Total** | **12** | **21** | **34** | **19** | **86 items** |

*Remaining 47 LOW findings are documentation/style nits requiring XS effort each.*
