# Ripple Next — Completed Roadmap Items (Archive)

> This archive contains all completed roadmap items. Each item has a unique
> identifier (RN-XXX) for tracking. For active items, see [the roadmap](./README.md).

---

## Phase 1: Do Now — COMPLETE

All Phase 1 items were completed during the initial platform build-out.

---

### RN-001: Security Pipeline (`security.yml`)

**Phase:** 1 | **Impact:** Very High | **Effort:** Medium | **Risk:** Low
**Resolved blocker:** No security/supply-chain workflow gates (SAST/SCA/secret scanning)

Added a security workflow with CodeQL for SAST, dependency scanning, and secret
scanning with SARIF upload to GitHub Security tab.

**Reference:** `.github/workflows/security.yml`

- [x] Create security.yml with CodeQL, dependency review, and Gitleaks
- [ ] Enable GitHub Advanced Security on the repository
- [ ] Validate SARIF upload produces findings in Security tab
- [ ] Add branch protection rule requiring security checks to pass

---

### RN-002: Doctor Machine Mode (`--json`, `--offline`)

**Phase:** 1 | **Impact:** High | **Effort:** Medium | **Risk:** Low
**Resolved blocker:** Doctor had non-resilient network check, no machine-readable output

Upgraded `scripts/doctor.sh` to support `--json` flag for machine-readable output
and resilient network checks (soft-fail on network when `--offline` is passed).

**Reference:** `scripts/doctor.sh`

- [x] Add `--json` flag for structured output
- [x] Add `--offline` flag for ephemeral runners
- [x] Demote network check from hard-fail to warning
- [ ] Update CI workflows to use `pnpm doctor --json` where appropriate

---

### RN-003: Environment Contract (`.env.example` + `pnpm bootstrap`)

**Phase:** 1 | **Impact:** High | **Effort:** Medium | **Risk:** Low
**Resolved blocker:** No standardized env contract artifact

Added `.env.example` documenting all environment variables with defaults and
descriptions. Added `pnpm bootstrap` command for zero-to-ready setup.

**Reference:** `.env.example`, `package.json`

- [x] Create `.env.example` with all env vars documented
- [x] Add `pnpm bootstrap` command to package.json
- [ ] Verify docker-compose uses matching env var names

---

### RN-004: Drupal/Tide CMS Integration (`@ripple/cms`)

**Phase:** 1 | **Impact:** Very High | **Effort:** High | **Risk:** Medium
**Resolved blocker:** Missing CMS content layer

The original Ripple design system is built on Drupal/Tide. Created `@ripple/cms`
with Drupal JSON:API integration and a mock provider for testing, following the
provider pattern. Full decoupling architecture isolates Drupal to 2 files.

**Reference:** `packages/cms/`, [ADR-009](../adr/009-cms-provider-drupal.md), [ADR-011](../adr/011-cms-decoupling-pull-out-drupal.md)

- [x] Create `packages/cms/` with CMS provider interface (`types.ts`)
- [x] Implement `MockCmsProvider` for tests and local dev
- [x] Implement `DrupalCmsProvider` with JSON:API client for Tide
- [x] Add CMS conformance test suite to `packages/testing/conformance/`
- [x] Add content type Zod schemas to `packages/validation/`
- [x] Wire CMS provider into Nuxt server context
- [x] Add `NUXT_CMS_BASE_URL` to `.env.example` and runtime config
- [x] Update `readiness.json` with CMS subsystem entry

---

### RN-005: CI Test Artifact Upload

**Phase:** 1 | **Impact:** Medium | **Effort:** Low | **Risk:** Low

Added structured test result uploads (JUnit XML + coverage reports) to the test
job in CI for better observability.

**Reference:** [ADR-010](../adr/010-ci-observability-supply-chain.md)

- [x] Add Vitest JUnit reporter to test configuration
- [x] Upload test results as artifacts in CI (30-day retention)
- [x] Standardized artifact naming convention (`test-results-unit`, `test-results-e2e`)

---

## Phase 2: Do Next — Completed Items

---

### RN-006: Mandatory SBOM in Release Workflow

**Phase:** 2 | **Impact:** High | **Effort:** Low | **Risk:** Low
**Source:** AI Principal Engineer review

Removed `continue-on-error: true` from SBOM generation step in the release
workflow. SBOM/provenance is now fail-fast mandatory.

**Reference:** `.github/workflows/release.yml`

- [x] Make SBOM mandatory in release (removed `continue-on-error`)

---

### RN-007: Unified CI Test Entrypoint

**Phase:** 2 | **Impact:** High | **Effort:** Low | **Risk:** Low
**Source:** AI Principal Engineer review

Unified fragmented test commands into a single `pnpm test:ci` invocation with
optional coverage flags.

**Reference:** `.github/actions/test/action.yml`, `package.json`

- [x] Unify CI test entrypoint (single `pnpm test:ci` with optional coverage flags)

---

### RN-008: Env Schema Validation Gate (ADR-012)

**Phase:** 2 | **Impact:** High | **Effort:** Medium | **Risk:** Low
**Source:** AI Principal Engineer review

Added Zod-based env schema validation to `@ripple/validation` with a
`pnpm validate:env` command that fails with structured JSON diagnostics when
the required env contract is invalid.

**Reference:** `packages/validation/`, [ADR-012](../adr/012-env-schema-validation.md)

- [x] Add Zod-based env schema validation gate (`pnpm validate:env` + CI integration)

---

### RN-009: Devcontainer Baseline

**Phase:** 2 | **Impact:** High | **Effort:** Medium | **Risk:** Low
**Source:** AI Principal Engineer review

Shipped `.devcontainer/` with Node 22, Docker-in-Docker, GitHub CLI, AWS CLI,
and all local services (Postgres, Redis, MinIO, Mailpit, MeiliSearch)
pre-configured. Post-create script runs install, migrations, seed, and Nuxt
type generation.

**Reference:** `.devcontainer/`

- [x] Devcontainer baseline (`.devcontainer/` — already existed, now documented in roadmap)

---

### RN-010: Flaky Test Containment Policy (ADR-013)

**Phase:** 2 | **Impact:** High | **Effort:** Low | **Risk:** Low
**Source:** AI Principal Engineer review

Implemented quarantine convention with `pnpm check:quarantine` CI gate, 14-day
time box, 5% budget cap, Tier 1 protection, and mandatory issue linkage.

**Reference:** [ADR-013](../adr/013-flaky-test-containment.md)

- [x] Quarantine convention with naming pattern
- [x] 14-day time box for resolution
- [x] 5% budget cap on quarantined tests
- [x] Tier 1 protection (auth/db/queue never quarantined)
- [x] `pnpm check:quarantine` CI gate

---

### RN-011: Preview Deploy Guardrails (ADR-014)

**Phase:** 2 | **Impact:** Medium | **Effort:** Medium | **Risk:** Low
**Source:** AI Principal Engineer review
**Resolved blocker:** Preview deploy depended on long-lived repo secret naming convention

Implemented GitHub environment protection, label-gated deploys, infra change
auto-deploy, and duplicate comment prevention.

**Reference:** [ADR-014](../adr/014-preview-deploy-guardrails.md)

- [x] GitHub environment protection
- [x] Label-gated deploys
- [x] Infra change auto-deploy
- [x] Duplicate comment prevention

---

### RN-012: CMS Page Rendering + Tide Components + Decoupling

**Phase:** 2 | **Impact:** Very High | **Effort:** High | **Risk:** Medium

Built Nuxt pages and UI components that render content from the CMS provider,
achieving visual and functional parity with the original Ripple design system's
Tide content types. Implemented full decoupling architecture per ADR-011.

**Reference:** `packages/cms/`, `apps/web/`, [ADR-011](../adr/011-cms-decoupling-pull-out-drupal.md)

- [x] Create dynamic page route (`/[...slug].vue`) that fetches from CMS provider
- [x] Implement Tide-compatible components (accordion, card collection, timeline, etc.)
- [x] Full Tide paragraph-to-section mapping (all 8 paragraph types)
- [x] Provider factory with dynamic imports (`createCmsProvider()`)
- [x] DrupalCmsProvider unit tests with JSON:API fixture data
- [x] ADR-011: CMS decoupling strategy with removal/addition procedures

> **Note:** Some sub-items from this effort remain active — see
> [RN-019](./README.md#rn-019-navigationmenu-component),
> [RN-021](./README.md#rn-021-media-gallery--document-download-components),
> [RN-023](./README.md#rn-023-landing-page--content-templates).
> Storybook stories completed in [RN-020](#rn-020-storybook-stories-for-tide-components).

---

### RN-013: Standardized CI Artifacts

**Phase:** 2 | **Impact:** High | **Effort:** Medium | **Risk:** Low

JUnit XML, coverage reports, and test logs for every CI job with consistent
retention and naming policy.

**Reference:** [ADR-010](../adr/010-ci-observability-supply-chain.md)

- [x] Configure Vitest JUnit reporter across all workspaces
- [x] Upload artifacts with standardized naming (`test-results-unit`, `test-results-e2e`)
- [x] Set retention policy (30 days for reports, 7 days for traces, 90 days for SBOM)

---

### RN-014: SBOM + Provenance in Release

**Phase:** 2 | **Impact:** High | **Effort:** Medium | **Risk:** Medium

Added CycloneDX SBOM generation and signed attestations to the release workflow.

**Reference:** [ADR-010](../adr/010-ci-observability-supply-chain.md), `.github/workflows/release.yml`

- [x] Add `@cyclonedx/cyclonedx-npm` to release pipeline
- [x] Generate provenance attestations with `actions/attest-build-provenance`
- [x] Upload SBOM alongside package releases (90-day retention)

---

### RN-015: Reusable Composite Actions

**Phase:** 2 | **Impact:** Very High | **Effort:** Medium | **Risk:** Medium

Published reusable GitHub Actions for lint/test/typecheck/setup patterns that
downstream repos can reference.

**Reference:** `.github/actions/`, [ADR-010](../adr/010-ci-observability-supply-chain.md)

- [x] Extract workflow steps into reusable composite actions
- [x] Create `.github/actions/` directory with `setup`, `quality`, `test` actions
- [x] CI workflow updated to use composite actions (reduced duplication)

> **Note:** Downstream documentation completed — see
> [RN-022](#rn-022-downstream-workflow-documentation).

---

### RN-016: Hermetic Dev/Runtime (Devcontainer)

**Phase:** 3 (completed early) | **Impact:** High | **Effort:** High | **Risk:** Medium

Devcontainer baseline shipped in `.devcontainer/` with Node 22, Docker-in-Docker,
GitHub CLI, AWS CLI, and all local services pre-configured.

**Reference:** `.devcontainer/`

- [x] Evaluate devcontainer vs Nix for agent runner reproducibility — devcontainer chosen
- [x] Create hermetic profile that pins all system dependencies
- [ ] Validate in CI with containerized runners (optional — devcontainer primarily for local dev)

---

### RN-020: Storybook Stories for Tide Components

**Phase:** 2 | **Impact:** Low | **Effort:** Low | **Risk:** Low
**Continues:** [RN-012](#rn-012-cms-page-rendering--tide-components--decoupling)

Added Storybook stories with autodocs for all 8 Tide-compatible content
components: accordion, card collection, timeline, call-to-action, key dates,
content image, embedded video, and wysiwyg. Each story includes multiple
variants (default, with/without optional props, rich content).

**Reference:** `packages/ui/components/organisms/content/*.stories.ts`

- [x] Add Storybook stories for accordion, card collection, timeline
- [x] Add Storybook stories for CTA, key dates, image, video, wysiwyg
- [ ] Configure Chromatic or Percy for visual regression (deferred — optional enhancement)

---

### RN-022: Downstream Workflow Documentation

**Phase:** 2 | **Impact:** Medium | **Effort:** Low | **Risk:** Low
**Continues:** [RN-015](#rn-015-reusable-composite-actions)

Wrote comprehensive consumption guide for downstream repos documenting how to
use the `setup`, `quality`, and `test` composite actions. Includes example
workflow files (minimal CI, tiered CI, publish), version pinning strategy
(SHA, tag, branch), troubleshooting, and artifact reference.

**Reference:** `docs/downstream-workflows.md`

- [x] Write consumption guide for `setup`, `quality`, `test` actions
- [x] Add example workflow files for downstream repos
- [x] Document version pinning strategy for action references

---

### RN-018: Search Integration Provider

**Phase:** 2 | **Impact:** Medium | **Effort:** Medium | **Risk:** Medium

Dedicated search provider layer with `SearchEngine` interface, `MeiliSearchEngine`
for local dev, and `SearchEnhancedCmsProvider` decorator that wraps any `CmsProvider`
and delegates search queries to the external engine while forwarding all other
operations to the inner provider.

**Reference:** `packages/cms/providers/search.ts`, `packages/cms/tests/search.test.ts`

- [x] Define `SearchEngine` interface and `SearchDocument` type
- [x] Implement `MeiliSearchEngine` for local dev (MeiliSearch HTTP API)
- [x] Implement `SearchEnhancedCmsProvider` decorator pattern
- [x] Add unit tests for search provider (MemorySearchEngine + integration)
- [x] Export search provider from `@ripple/cms` package

---

### RN-019: Navigation/Menu Component

**Phase:** 2 | **Impact:** Medium | **Effort:** Medium | **Risk:** Low
**Continues:** [RN-012](#rn-012-cms-page-rendering--tide-components--decoupling)

Navigation components and composable for rendering CMS-provided menu structures
in header and footer, with nested menu support.

**Reference:** `packages/ui/components/molecules/RplNavigation.vue`, `apps/web/composables/useNavigation.ts`

- [x] Create `useNavigation()` composable with header/footer menu loading
- [x] Build `RplNavigation` component with horizontal/vertical variants
- [x] Wire navigation into default layout (header + footer slots)
- [x] Support nested menu structures from CMS (with depth flattening)
- [x] Add Vue Test Utils tests for navigation component

---

### RN-030: UI Component Test Suite

**Phase:** 2 | **Impact:** Medium | **Effort:** Medium | **Risk:** Low
**Source:** AI agent gap analysis
**Continues:** [RN-020](#rn-020-storybook-stories-for-tide-components)

Vue Test Utils component tests for all 16 UI components — atoms, molecules,
organisms, and all 8 Tide content section renderers. Moves the UI subsystem
from "partial" to "implemented" status.

**Reference:** `packages/ui/tests/`

- [x] Add component tests for atoms (RplButton, RplFormInput, RplIcon)
- [x] Add component tests for molecules (RplCard, RplHeroHeader, RplNavigation)
- [x] Add component tests for organisms (RplHeader, RplFooter)
- [x] Add component tests for Tide content (Accordion, CardCollection, CTA, Wysiwyg, Image, Video, KeyDates, Timeline)

---

### RN-031: Testcontainers Integration Tests for DB + API

**Phase:** 2 | **Impact:** High | **Effort:** Medium | **Risk:** Medium
**Source:** AI agent gap analysis

Integration tests using Testcontainers for `@ripple/db` repositories. Tests run
against a real PostgreSQL 17 container — no mocking of database behavior.

**Reference:** `packages/db/tests/integration/`

- [x] Add Testcontainers-based integration tests for UserRepository (9 tests)
- [x] Add Testcontainers-based integration tests for ProjectRepository (8 tests)
- [x] Validate CRUD operations, unique constraints, and foreign key relationships

---

## Summary

| ID | Item | Phase | Status |
|----|------|-------|--------|
| [RN-001](#rn-001-security-pipeline-securityyml) | Security Pipeline | 1 | **Done** |
| [RN-002](#rn-002-doctor-machine-mode---json---offline) | Doctor Machine Mode | 1 | **Done** |
| [RN-003](#rn-003-environment-contract-envexample--pnpm-bootstrap) | Environment Contract | 1 | **Done** |
| [RN-004](#rn-004-drupaltide-cms-integration-ripplecms) | Drupal/Tide CMS Integration | 1 | **Done** |
| [RN-005](#rn-005-ci-test-artifact-upload) | CI Test Artifact Upload | 1 | **Done** |
| [RN-006](#rn-006-mandatory-sbom-in-release-workflow) | Mandatory SBOM in Release | 2 | **Done** |
| [RN-007](#rn-007-unified-ci-test-entrypoint) | Unified CI Test Entrypoint | 2 | **Done** |
| [RN-008](#rn-008-env-schema-validation-gate-adr-012) | Env Schema Validation | 2 | **Done** |
| [RN-009](#rn-009-devcontainer-baseline) | Devcontainer Baseline | 2 | **Done** |
| [RN-010](#rn-010-flaky-test-containment-policy-adr-013) | Flaky Test Containment | 2 | **Done** |
| [RN-011](#rn-011-preview-deploy-guardrails-adr-014) | Preview Deploy Guardrails | 2 | **Done** |
| [RN-012](#rn-012-cms-page-rendering--tide-components--decoupling) | CMS Page Rendering + Tide | 2 | **Done** |
| [RN-013](#rn-013-standardized-ci-artifacts) | Standardized CI Artifacts | 2 | **Done** |
| [RN-014](#rn-014-sbom--provenance-in-release) | SBOM + Provenance in Release | 2 | **Done** |
| [RN-015](#rn-015-reusable-composite-actions) | Reusable Composite Actions | 2 | **Done** |
| [RN-016](#rn-016-hermetic-devruntime-devcontainer) | Hermetic Dev/Runtime | 3 | **Done** |
| [RN-018](#rn-018-search-integration-provider) | Search Integration Provider | 2 | **Done** |
| [RN-019](#rn-019-navigationmenu-component) | Navigation/Menu Component | 2 | **Done** |
| [RN-020](#rn-020-storybook-stories-for-tide-components) | Storybook Stories (Tide) | 2 | **Done** |
| [RN-022](#rn-022-downstream-workflow-documentation) | Downstream Workflow Docs | 2 | **Done** |
| [RN-030](#rn-030-ui-component-test-suite) | UI Component Test Suite | 2 | **Done** |
| [RN-031](#rn-031-testcontainers-integration-tests-for-db--api) | Testcontainers Integration Tests | 2 | **Done** |
