# Full Codebase Audit Report

**Date:** 2026-03-06
**Branch:** `audit_20260306`
**Baseline:** Typecheck PASS (30/30), Lint PASS (30/30), Tests PASS (54/54)

---

## Table of Contents

1. [Code Quality & Type Safety](#1-code-quality--type-safety)
2. [Test Integrity & Coverage](#2-test-integrity--coverage)
3. [Downstream Consumer Compatibility](#3-downstream-consumer-compatibility)
4. [Accessibility Compliance](#4-accessibility-compliance)
5. [Infrastructure & Security](#5-infrastructure--security)
6. [Documentation Accuracy](#6-documentation-accuracy)

---

## 1. Code Quality & Type Safety

**Auditor:** Code Quality Specialist
**Files reviewed:** 348 source files across 14 packages, 4 services, 1 app

### Summary: 0 CRITICAL, 12 HIGH, 25 MEDIUM, 28 LOW = 65 findings

### 1.1 Type Safety — Zero `any` Types (PASS)

No instances of `: any`, `as any`, or `<any>` in any source file. The `@typescript-eslint/no-explicit-any` rule is fully enforced.

### 1.2 Type Assertions (`as Type`)

24 type assertions found in production code. Most are acceptable patterns (DOM event targets in Vue templates, Object.keys() casts). Notable concerns:

| ID | Severity | File | Issue |
|----|----------|------|-------|
| CODE-005 | MEDIUM | apps/web/server/api/cms/pages.get.ts:10-14 | Query params cast to CmsListOptions without Zod validation |
| CODE-009 | MEDIUM | packages/cms/providers/drupal.ts:330 | Unvalidated JSON response cast to generic type |
| CODE-013 | MEDIUM | packages/cli/src/commands/secrets.ts:27-62 | Multiple JSON parse + cast chains without validation |

### 1.3 Non-Null Assertions — 5 HIGH Findings

| ID | File | Issue |
|----|------|-------|
| CODE-025 | apps/web/server/utils/auth-provider.ts:47 | `user!.id, user!.email` after nullable findById |
| CODE-026 | packages/storage/providers/s3.ts:50 | `result.Body!.transformToByteArray()` |
| CODE-027 | packages/storage/providers/s3.ts:72-74 | `obj.Key!, obj.Size!, obj.LastModified!` |
| CODE-028 | packages/db/repositories/user.repository.ts:10 | `return user!` after insert |
| CODE-029 | packages/db/repositories/user.repository.ts:33 | `return user!` after update |

### 1.4 Vue Component Compliance — All 56 Components Pass Pattern Checks

- All use `<script setup lang="ts">`
- All use `defineProps<{...}>()`
- Zero Options API, zero `this.` references, zero mixins
- All CSS classes use `rpl-` BEM prefix
- Consistent `variant` and `size` prop naming

### 1.5 Hardcoded Design Values — Systemic Finding

**54 hardcoded hex colours** across 16 components (CODE-038 through CODE-053). Examples:
- `#fff` used ~30 times
- Variant-specific colours in RplTag, RplAlert, RplFormAlert, RplCallout
- File-type badge colours in RplDocumentDownload

**~130 hardcoded px values** including border-radius, max-width, outline-offset, and breakpoints.

**~30 raw font-size values** without design tokens, while other components correctly use `var(--rpl-type-size-*)`.

### 1.6 Console Violations

| ID | Severity | File | Issue |
|----|----------|------|-------|
| CODE-062 | HIGH | packages/queue/consumer.ts:35 | `console.error()` in non-exempt file |
| CODE-066 | LOW | services/worker/handlers/index.ts | Multiple console calls in non-exempt file |

### 1.7 Stub Handlers

Three service handlers are empty stubs without tracking tickets:
- services/cron/cleanup.handler.ts (CODE-075)
- services/cron/reports.handler.ts (CODE-076)
- services/events/user-created.handler.ts (CODE-077)

### 1.8 Infrastructure Code

| ID | Severity | File | Issue |
|----|----------|------|-------|
| CODE-073 | HIGH | infra/github-oidc.ts:127 | Hardcoded `PowerUserAccess` ARN |
| CODE-074 | MEDIUM | infra/github-oidc.ts:160,171 | Hardcoded ARN patterns with wildcard account |

---

## 2. Test Integrity & Coverage

**Auditor:** Test Integrity Specialist
**Test files reviewed:** All test/spec files across the monorepo

### Summary: 7 CRITICAL, 14 HIGH, 16 MEDIUM, 16 LOW = 53 findings

### 2.1 Critical Untested Files

| ID | File | Risk |
|----|------|------|
| TEST-001 | packages/shared/utils/index.ts | Utilities used across 14 packages have zero tests |
| TEST-004 | packages/queue/providers/sqs.ts | Production queue provider untested |
| TEST-005 | packages/queue/providers/bullmq.ts | Local dev queue provider untested |
| TEST-006 | packages/queue/consumer.ts | Message consumer with retry/DLQ logic untested |
| TEST-007 | packages/email/providers/ses.ts | Production email provider untested |
| TEST-014 | packages/db/repositories/session.repository.ts | Auth-critical repository, zero tests |

### 2.2 Untested Cloud Providers (7 total)

All cloud/production provider implementations have zero unit tests:
SQS, BullMQ, SES, S3, MinIO, AWS Secrets, Chain Secrets.

Only memory/mock providers are tested. Conformance suites exist for all 7 provider types but only run against memory implementations.

### 2.3 Untested Services (4 handlers)

- cleanup.handler.ts, reports.handler.ts (cron)
- user-created.handler.ts (events)
- websocket/server.ts

### 2.4 Untested App Files

- useAuth.ts, useCms.ts, useNavigation.ts composables
- auth.ts middleware
- 6 CMS API routes, 3 auth routes

### 2.5 Coverage Infrastructure Gaps

| ID | Severity | Issue |
|----|----------|-------|
| TEST-046 | HIGH | shared, config, cli, secrets have no vitest workspace entry — no coverage thresholds |
| TEST-047 | MEDIUM | apps/web has no coverage thresholds |
| TEST-039 | MEDIUM | MemorySecretsProvider not in centralized MockProviders factory |
| TEST-053 | MEDIUM | secretsConformance not exported from testing/conformance/index.ts |

### 2.6 Positive Findings

- Zero `it.skip`, `describe.skip`, `it.only`, `describe.only` — clean test suite
- 55/56 Vue components have test files with meaningful assertions
- All mock providers correctly implement full interfaces
- All async tests properly use await
- Integration tests properly gated behind Docker availability

---

## 3. Downstream Consumer Compatibility

**Auditor:** Downstream Compatibility Specialist
**Priority:** HIGHEST — this is why ripple-next exists

### Summary: 3 CRITICAL, 6 HIGH, 7 MEDIUM, 4 LOW = 20 findings

### 3.1 CRITICAL Blockers

| ID | Package | Issue |
|----|---------|-------|
| DOWNSTREAM-001 | @ripple-next/ui | No type declarations — `declaration: false`, no .d.ts output |
| DOWNSTREAM-002 | @ripple-next/testing | Unpublishable — no exports map, raw .ts entry, no build step |
| DOWNSTREAM-003 | docs/consumer-app-guide.md | .npmrc scope mismatch — `@ripple:` should be `@ripple-next:` |

### 3.2 HIGH Issues

| ID | Package | Issue |
|----|---------|-------|
| DOWNSTREAM-007 | @ripple-next/ui | `vue` as regular dependency — causes duplicate instances |
| DOWNSTREAM-008 | @ripple-next/ui | `@nuxt/kit` as regular dependency — bloats non-Nuxt consumers |
| DOWNSTREAM-005 | @ripple-next/testing | secretsConformance not exported from barrel |
| DOWNSTREAM-014 | @ripple-next/db | `export *` leaks Drizzle table objects as public API |
| DOWNSTREAM-016 | @ripple-next/ui | publishConfig.exports missing `types` conditions |
| DOWNSTREAM-019 | Multiple | Package READMEs document non-functional import paths |

### 3.3 Systemic Issues

- **Zero packages declare peerDependencies** (DOWNSTREAM-010)
- **Zero packages declare sideEffects** (DOWNSTREAM-012)
- **No per-component subpath exports** for tree-shaking (DOWNSTREAM-013)

See [Downstream Risk Assessment](./downstream-risk-assessment.md) for full package-by-package status.

---

## 4. Accessibility Compliance

**Auditor:** WCAG 2.1 AA Specialist
**Components audited:** 56 .vue files in packages/ui/

### Summary: 2 CRITICAL, 5 HIGH, 9 MEDIUM, 7 LOW = 23 findings

### 4.1 CRITICAL

| ID | Component | WCAG | Issue |
|----|-----------|------|-------|
| A11Y-001 | 5 form components | 2.4.7 Focus Visible | `:focus { outline: none }` instead of `:focus-visible` |
| A11Y-005 | RplMediaEmbed | 2.1.2 No Keyboard Trap | Fullscreen dialog has no focus trap, no Escape handling |

### 4.2 HIGH

| ID | Component | WCAG | Issue |
|----|-----------|------|-------|
| A11Y-002 | RplButton | 2.4.7 Focus Visible | No `:focus-visible` style at all |
| A11Y-003 | RplCard | 2.4.7 Focus Visible | Link variant lacks focus indicator |
| A11Y-004 | RplNavigationList | 2.4.7 Focus Visible | Sublinks missing focus styles |
| A11Y-006 | RplMediaGallery | 2.1.2 No Keyboard Trap | Lightbox has no focus trap |
| A11Y-018 | 20 components | 2.3.3 Animation | CSS transitions ignore prefers-reduced-motion |
| A11Y-019 | RplContentWysiwyg | Multiple | v-html content has no a11y guarantees |

### 4.3 MEDIUM (Systemic)

- **9 form components** missing `aria-required` on required fields (A11Y-008)
- RplAccordion panel missing `aria-labelledby` (A11Y-007)
- RplCampaignBanner, RplContactUs missing semantic landmarks (A11Y-009, A11Y-011)
- RplKeyDates, RplTimeline use divs instead of semantic lists (A11Y-012)
- RplForm fieldset missing `<legend>` (A11Y-013)
- RplTextarea character counter not announced (A11Y-014)
- No axe-core in component unit tests (A11Y-020)

### 4.4 Functional Bugs Found by A11Y Audit

| ID | Component | Issue |
|----|-----------|-------|
| A11Y-016 | RplCardCollection | Passes `:link` prop but RplCard expects `:href` — cards never link |
| A11Y-017 | RplCallToAction | Passes `:href` to RplButton which only renders `<button>` — CTA never navigates |

### 4.5 Components with Zero Findings (23 of 56)

RplIcon, RplBlockQuote, RplAcknowledgement, RplCallout, RplFormAlert, RplAlert, RplBreadcrumb, RplPagination, RplTabs, RplInPageNavigation, RplRelatedLinks, RplDetailList, RplDocumentDownload, RplStatisticsGrid, RplResultsListing, RplFooter, RplSocialShare, RplEmbeddedVideo, RplPageAction, RplMediaFullscreen, RplVerticalNav, RplRadio, RplCheckbox.

---

## 5. Infrastructure & Security

**Auditor:** Infrastructure & Security Specialist

### Summary: 0 CRITICAL, 2 HIGH, 3 MEDIUM, 5 LOW = 10 findings (+ 16 PASS)

### 5.1 HIGH

| ID | File | Issue |
|----|------|-------|
| INFRA-001 | infra/github-oidc.ts:127 | PowerUserAccess managed policy — near-admin AWS access |
| INFRA-010 | All workflows | GitHub Actions pinned to mutable tags — supply chain risk |

### 5.2 MEDIUM

| ID | File | Issue |
|----|------|-------|
| INFRA-002 | sst.config.ts:43-47 | S3 CORS `allowOrigins: ['*']` |
| INFRA-013 | e2e.yml | Missing concurrency group |
| INFRA-041 | packages/db/drizzle.config.ts:8 | `process.env.DATABASE_URL!` non-null assertion |

### 5.3 Clean Areas (PASS)

- SST config: no hardcoded ARNs, no CDK imports, reasonable Lambda config
- OIDC auth: PKCE flow, httpOnly cookies, CSRF validation, session expiry
- OIDC trust policy: properly scoped to repo/branch/environment
- All deploys use OIDC federation — no stored AWS credentials
- Env validation with Zod, .env.example documented
- Dependency review blocks high-severity vulns and GPL/AGPL licenses
- Gitleaks secret scanning in CI
- CycloneDX SBOM and build provenance on releases
- Frozen lockfile enforced on all installs
- No secrets/tokens in source code

---

## 6. Documentation Accuracy

**Auditor:** Documentation Cross-Reference Specialist

### Summary: 0 CRITICAL, 1 HIGH, 7 MEDIUM, 12 LOW = 20 findings

### 6.1 HIGH

| ID | Document | Issue |
|----|----------|-------|
| DOC-017 | docs/adr/README.md | ADRs 024, 025, 026 marked "Proposed" but fully implemented |

### 6.2 MEDIUM

| ID | Document | Issue |
|----|----------|-------|
| DOC-001 | platform-capabilities.md | Error taxonomy count: says 68+, actual 94 |
| DOC-002 | platform-capabilities.md | CMS maturity: says conformance-tested, actual integration-tested |
| DOC-004 | platform-capabilities.md | Generator command: says `generate:api-endpoint`, actual `generate:endpoint` |
| DOC-006 | product-roadmap/README.md | Subsystem count: says 16, actual 18 |
| DOC-007 | product-roadmap/README.md | Maturity distribution outdated |
| DOC-010 | architecture.md | ADR count: says 26, actual 28 |
| DOC-012 | README.md | Structure section missing packages/config, secrets, cli |
| DOC-023 | error-taxonomy.json | Self-description: says 85 codes, actual 94 |

### 6.3 Clean Areas

- All API contracts match implementation (DOC-009)
- All internal markdown links resolve (DOC-019)
- Storybook configuration consistent (DOC-026)
- Downstream adoption guide imports correct (DOC-008)
- All AGENTS.md file paths verified (DOC-015)
- CLAUDE.md within ADR-020 line count target (DOC-016)
