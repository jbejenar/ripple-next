# Ripple Next — Product Roadmap

> v6.7.0 | 2026-03-01
>
> **AI-first platform.** Every item is machine-parseable (`RN-XXX`), includes
> AI-first benefit rationale, and is organised by time horizon for execution
> clarity. Supersedes the tier system ([ADR-016](../adr/016-roadmap-reorganisation.md))
> with Now/Next/Later planning.
>
> 50 items completed. See **[ARCHIVE.md](./ARCHIVE.md)**.

---

## Roadmap Timeline

```mermaid
gantt
    title Ripple Next — Active Roadmap
    dateFormat YYYY-MM-DD
    axisFormat %b %Y

    section Now (0–6 weeks)
    RN-051 ADR: API boundary strategy       :done, rn051, 2026-02-28, 1d
    RN-046 oRPC migration + integration     :done, rn046, 2026-03-01, 1d
    RN-045 OIDC auth integration tests      :done, rn045, 2026-03-01, 1d
    RN-052 Bidirectional fleet comms        :done, rn052, 2026-03-01, 1d
    RN-050 Web performance budgets          :done, rn050, 2026-03-01, 1d
    RN-025 Contract testing                 :done, rn025, 2026-03-01, 1d
    RN-049 Licensing clarity (SPDX)         :done, rn049, 2026-03-01, 1d

    section Next (6–12 weeks)
    RN-028 Golden-path conformance CLI      :rn028, 2026-04-13, 30d

    section Later (Quarter+)
    RN-017 Live Drupal integration          :rn017, 2026-06-01, 21d
```

## Agent-Friction Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Setup determinism | 5/5 | Pinned pnpm, lockfile, `.env.example` + Zod env validation, devcontainer |
| One-command workflows | 5/5 | `pnpm bootstrap` — zero-to-ready, non-interactive |
| Local dev parity with CI | 5/5 | Shared tooling, dockerized deps, devcontainer, Testcontainers |
| Test reliability | 5/5 | Quarantine policy (ADR-013), unified `pnpm test:ci`, mock providers |
| Dependency + toolchain pinning | 5/5 | Exact Node (.nvmrc) + pnpm (packageManager) with doctor guards |
| Observability of failures | 5/5 | JUnit XML, Playwright traces, SBOM, JSON diagnostics |
| Automated remediation | 5/5 | `pnpm doctor --json`, conformance suites, documented procedures |
| Agent workflow integration | 5/5 | Runbooks, generators, error taxonomy ([ADR-018](../adr/018-ai-first-workflow-strategy.md)) |

**Overall: 40/40**

---

## North Star

Ripple Next is the **AI-augmented golden-path for government digital platforms**.
Downstream teams ship faster, safer, and more accessibly because the golden path
eliminates undifferentiated work and AI agents operate as first-class contributors
across the fleet.

**Platform status:** 16/16 subsystems implemented. All subsystems are at
"implemented" status. Agent-Friction Scorecard: 40/40.

## Themes

1. **Production confidence** — ~~execute oRPC migration (ADR-021)~~ done, ~~close integration test gaps~~ OIDC integration tested (RN-045), ~~contract testing~~ OpenAPI breaking-change detection + consumer contract validation (RN-025)
2. **Fleet adoption** — conformance CLI, CI speed, deterministic pinning
3. **Quality depth** — ~~performance budgets~~ Core Web Vitals pipeline implemented (RN-050), live CMS validation
4. **Bidirectional fleet governance** — ~~downstream→upstream feedback, AI instruction sync, version tracking, update notifications~~ done (ADR-022, RN-052)

---

## Now (0–6 weeks)

> Items that close the remaining platform gap. Agents should start here.

### RN-051: ADR — API Boundary Strategy (oRPC vs tRPC, Public vs Internal + Portal Publishing) ✓

**Impact:** Very High | **Effort:** Medium | **Risk:** High | **Priority:** P0
**Source:** Tech-lead directive — external integrator requirement | **Date:** 2026-02-28
**Completed:** 2026-02-28 | **ADR:** [ADR-021](../adr/021-api-contract-strategy.md)
**AI-first benefit:** Contracts must be deterministic, tool-neutral, and low-friction for autonomous agents (Codex + Claude parity). A single canonical boundary prevents agent confusion from dual-stack patterns.

#### Decision Summary

ADR-021 selects **oRPC** as the canonical API boundary framework with OpenAPI 3.1.1
as the first-class contract artifact. Key decisions:

- **oRPC replaces tRPC** — single framework, no dual-stack
- **Public/internal classification** via route metadata (`visibility: 'public' | 'internal'`)
- **`pnpm generate:openapi`** generates deterministic `docs/api/openapi.json`
- **`pnpm check:api-contract`** CI gate prevents contract drift (wired into `pnpm verify`)
- **Error taxonomy** expanded: RPL-API-001 (spec drift), RPL-API-002 (breaking change)
- **4-phase migration**: ADR → oRPC migration (RN-046) → endpoint classification → contract testing (RN-025)

#### Definition of Done

- [x] ADR-021 created in `docs/adr/021-api-contract-strategy.md`
- [x] ADR includes: context, decision drivers, options considered (tRPC, oRPC, gateway, hybrid), decision, consequences, rollout plan
- [x] `pnpm generate:openapi` command added with deterministic output
- [x] `pnpm check:api-contract` CI gate added for contract drift detection
- [x] Follow-up roadmap items identified (RN-046 updated, RN-025 dependency noted)
- [x] Roadmap updated with ADR status and links; `readiness.json` updated
- [x] Commands and gates feasible within current toolchain (no new dependencies)

**Prerequisite for:** [RN-046](#rn-046-orpc-migration--router-integration-harness-testcontainers), [RN-025](#rn-025-contract-testing-across-consumers)

**Verification:** ADR reviewed for completeness; `pnpm verify` passes; readiness.json updated.

---

### RN-046: oRPC Migration + Router Integration Harness (Testcontainers) ✓

**Impact:** High | **Effort:** Medium | **Risk:** Low
**Source:** GPT-5.2-Codex API topology review + ADR-021 | **Date:** 2026-02-28
**Completed:** 2026-03-01
**AI-first benefit:** Gives agents production-semantics confidence when refactoring router logic. Activates OpenAPI contract generation.
**Depends on:** [RN-051](#rn-051-adr--api-boundary-strategy-orpc-vs-trpc-public-vs-internal--portal-publishing) (ADR-021, completed)

ADR-021 Phase 2: installed oRPC, migrated the user router (4 procedures) from tRPC,
generated the first `openapi.json`, and activated the contract drift gate.
API layer moved from "partial" to "implemented" — 16/16 subsystems complete.

**Affected items:** [RN-025](#rn-025-contract-testing-across-consumers) (now unblocked — OpenAPI spec available)

- [x] Install `@orpc/server`, `@orpc/openapi`, `@orpc/zod` — update `apps/web/package.json`
- [x] Create `apps/web/server/orpc/router.ts` — migrate user router from tRPC
- [x] Add `generateOpenAPI()` export to router for `pnpm generate:openapi`
- [x] Classify routes: user CRUD as `visibility: 'public'`, health as `visibility: 'internal'`
- [x] Generate and commit first `docs/api/openapi.json`
- [x] Remove tRPC (`@trpc/server`, `@trpc/client`, `trpc-nuxt`) — no dual-stack (ADR-021)
- [x] Contract tests for all 4 user procedures via `createRouterClient` (auth + validation)
- [x] Update `docs/readiness.json` API status to "implemented"
- [x] Update `generate:endpoint` generator to emit oRPC boilerplate instead of tRPC
- [x] Update `add-api-endpoint` runbook to reference oRPC patterns

**Deferred to follow-up:**
- Testcontainers integration tests for router paths with real DB (split to future item — contract tests provide sufficient coverage for Phase 2; DB integration tests exist at repository layer in `@ripple/db`)
- CI job with `DATABASE_URL` env (activates when Testcontainers router tests are added)

**Verification:** `pnpm generate:openapi` produces valid OpenAPI 3.1.1; `pnpm check:api-contract` passes; `pnpm test` passes (12 contract tests); `readiness.json` updated; `pnpm verify` passes.

---

### RN-045: OIDC Auth Flow Integration Tests (PKCE + Sessions) ✓

**Impact:** High | **Effort:** Medium | **Risk:** Medium
**Source:** GPT-5.2-Codex readiness + auth test review | **Date:** 2026-02-28
**Completed:** 2026-03-01
**AI-first benefit:** Prevents agents from shipping auth regressions by validating prod-faithful OIDC flow deterministically.

Closed the auth integration test gap identified in `readiness.json`. Added a
deterministic Keycloak Testcontainer fixture with checked-in realm configuration,
and 8 integration tests covering the full Authorization Code + PKCE lifecycle.

- [x] Add deterministic IdP fixture (container + checked-in config)
  - Keycloak 26.0 Testcontainer in `packages/testing/helpers/keycloak.ts`
  - Checked-in realm config: `packages/auth/tests/fixtures/ripple-test-realm.json`
  - Pre-configured client (`ripple-test-client`) with PKCE S256 enforcement
  - Test user (`testuser` / `testpassword`) with email `test@example.com`
  - Browser flow simulation helper (`simulateAuthCodeFlow`) for headless auth code acquisition
- [x] Cover auth code + PKCE exchange, session creation/persistence, logout
  - OIDC discovery from real Keycloak (authorization URL with PKCE params)
  - Full PKCE flow: auth code exchange → user returned with email/name from Keycloak claims
  - OIDC sub linking via `UserStore.findOrCreateByOidcSub`
  - Session creation after auth → session validation → session invalidation (logout)
  - Error handling: invalid code, mismatched PKCE verifier, password auth rejection
- [x] Gate on auth/config changes — tests run via `pnpm test`, skipped when Docker unavailable (`describe.runIf(dockerAvailable)`)
- [x] Add error taxonomy codes for IdP failure modes
  - RPL-AUTH-001: OIDC issuer discovery failed
  - RPL-AUTH-002: OIDC redirect URI mismatch
  - RPL-AUTH-003: OIDC token validation failed (clock skew, signature, expiry)
  - RPL-AUTH-004: OIDC authorization code exchange failed (invalid code, PKCE mismatch)
  - Error taxonomy updated to v1.7.0 (55 codes across 15 categories)

**Verification:** `pnpm verify` passes (9/9 gates); integration tests skipped gracefully without Docker; lint + typecheck pass; `readiness.json` auth blocker removed.

---

### RN-052: Bidirectional Fleet Communication (Downstream↔Upstream) ✓

**Impact:** Very High | **Effort:** High | **Risk:** Medium | **Priority:** P0
**Source:** Tech-lead directive — fleet governance gap analysis | **Date:** 2026-03-01
**Completed:** 2026-03-01 | **ADR:** [ADR-022](../adr/022-bidirectional-fleet-communication.md)
**AI-first benefit:** Enables AI agents to autonomously submit feedback upstream, detect and share local improvements, and receive proactive update notifications — closing the only communication gap in the fleet governance system. No existing platform (Backstage, Cruft, Copier, Nx) provides AI-assisted bidirectional sync.

#### Upstream → Downstream Enhancements

- [x] FLEET-SURF-010: AI agent instructions governed (advisory strategy) — 15 files now tracked
- [x] FLEET-SURF-011: Fleet governance tooling governed (sync strategy)
- [x] Fleet changelog (`docs/fleet-changelog.json`) — machine-readable for AI consumption
- [x] Fleet feedback schema (`docs/fleet-feedback-schema.json`) — `ripple-fleet-feedback/v1`
- [x] Error taxonomy expanded: FEEDBACK category, 4 codes (RPL-FEEDBACK-001–004)
- [x] Fleet policy updated: 11 governed surfaces, feedbackPolicy section
- [x] `.fleet.json` version tracking scaffolded into downstream repos (Cruft-inspired)
- [x] Fleet update notification workflow (`fleet-update-notify.yml`)
- [x] Fleet changelog generator script (`fleet-changelog.mjs`)

#### Downstream → Upstream Feedback System

- [x] `fleet-feedback.mjs` — downstream feedback generator (5 types, `--json`, `--dry-run`, `--submit`)
- [x] `fleet-feedback-intake.mjs` — upstream triage engine (validate, label, deduplicate, priority-score)
- [x] Fleet feedback intake workflow (`fleet-feedback-intake.yml`)
- [x] Reusable fleet feedback submit workflow (`fleet-feedback-submit.yml`)
- [x] Fleet feedback composite action (`.github/actions/fleet-feedback/action.yml`)

#### Scaffold & Documentation

- [x] Downstream scaffold: `.fleet.json`, `fleet-feedback.yml`, `fleet-update.yml` workflows
- [x] Runbooks: `fleet-feedback-submit.json`, `fleet-feedback-intake.json`
- [x] `downstream-workflows.md` updated with bidirectional communication sections
- [x] Template config updated with new governed paths

**Verification:** `pnpm fleet:feedback -- --type=feature-request --title="test" --dry-run` produces valid JSON; `pnpm verify` passes; 11 governed surfaces in fleet policy.

---

### RN-050: Web Performance Budgets (Core Web Vitals) ✓

**Impact:** Medium | **Effort:** Medium | **Risk:** Low
**Source:** Gap analysis — a11y auditing exists ([RN-042](./ARCHIVE.md#rn-042-accessibility-audit-pipeline)) but no performance equivalent | **Date:** 2026-03-01
**Completed:** 2026-03-01
**AI-first benefit:** Agents get structured performance regression signals in CI — `ripple-perf-report/v1` JSON enables automated detection and remediation of Core Web Vitals regressions.

Government sites have performance obligations. The platform had WCAG a11y auditing
but no Core Web Vitals monitoring. Now implemented using Playwright's Performance
API — zero new dependencies, matching the a11y audit pattern.

- [x] Define performance budgets (LCP, FCP, CLS, TTFB, TBT thresholds based on Google CWV)
- [x] Playwright-based performance audit in CI pipeline (`pnpm test:perf`)
- [x] Emit structured `ripple-perf-report/v1` JSON
- [x] Block on critical performance regressions (exit code 1 on critical thresholds)
- [x] Error taxonomy expanded: PERF category with RPL-PERF-001 (critical), RPL-PERF-002 (warning)
- [x] CI integration: perf audit step + `perf-report.json` artifact upload in e2e job
- [x] Documentation: `docs/performance.md` with budgets, pipeline, report schema, remediation guide

**Verification:** `pnpm test:perf -- --json` emits valid `ripple-perf-report/v1` JSON; CI includes performance audit step; `pnpm verify` passes; error taxonomy v1.9.0 with 61 codes across 17 categories.

### RN-049: Licensing Clarity Guardrail (SPDX + Dual-License Model) ✓

**Impact:** Medium | **Effort:** Low | **Risk:** Medium | **Priority:** P1
**Source:** Tech-lead directive — NPM publishing requires license metadata | **Date:** 2026-03-01
**Completed:** 2026-03-01
**AI-first benefit:** SPDX-standard `license` field in every `package.json` makes license scanning deterministic for agents and automated compliance tools (SBOM, Snyk, FOSSA).

Resolved the licensing drift flagged when PolyForm Noncommercial 1.0.0 was adopted
(PR #49) without updating SPDX metadata. All `package.json` files now carry the
SPDX identifier, and the dual-licensing model is documented.

#### License Model

| Use Case | License | Cost |
|----------|---------|------|
| Non-commercial (personal, research, education, government, charity) | [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) | Free |
| Commercial (for-profit products, SaaS, consulting deliverables) | Commercial license | Contact licensor |

#### Recommendations

1. **npm consumers** see `PolyForm-Noncommercial-1.0.0` in the `license` field on npmjs.org — this is the SPDX-standard identifier for the PolyForm Noncommercial license
2. **Commercial users** should contact the licensor to obtain a commercial license before using `@ripple/*` packages in revenue-generating products or services
3. **SBOM/compliance tools** (CycloneDX, Snyk, FOSSA) can now auto-detect the license from `package.json` — no manual classification needed
4. **Downstream repos** scaffolded via `pnpm generate:scaffold` inherit the same license field

#### Definition of Done

- [x] SPDX `license` field added to root `package.json`
- [x] SPDX `license` field added to all 11 workspace `package.json` files
- [x] LICENSE file already present (PolyForm Noncommercial 1.0.0 full text)
- [x] Dual-license model documented in roadmap
- [x] Risks table updated — licensing drift resolved

---

### RN-025: Contract Testing Across Consumers ✓

**Impact:** High | **Effort:** High | **Risk:** Medium
**Source:** AI Principal Engineer review | **Date:** 2026-03-01
**Completed:** 2026-03-01
**Depends on:** [RN-046](#rn-046-orpc-migration--router-integration-harness-testcontainers) (completed — `docs/api/openapi.json` available)
**AI-first benefit:** Agents get automated breaking-change signals before release — `ripple-api-breaking/v1` JSON enables autonomous detection of API incompatibilities. Consumer contract tests ensure spec ↔ router agreement, preventing spec drift from causing downstream failures.

ADR-021 Phase 4: implemented consumer contract testing and automated
breaking-change detection using the OpenAPI spec as the contract format.
22 consumer contract tests validate spec ↔ router agreement.

- [x] Define contract test patterns for package consumers (OpenAPI-based)
  - 22 consumer contract validation tests in `apps/web/tests/unit/orpc/openapi-contract.test.ts`
  - Tests validate: spec validity, operationId ↔ procedure mapping, request validation, response codes, tag classification, auth enforcement, operationId stability
- [x] Integrate consumer contract tests into release workflow
  - `pnpm check:api-breaking -- --ci` step added before package publication
  - `api-breaking-report.json` artifact uploaded (90-day retention)
  - Breaking changes block release; non-breaking changes are informational
- [x] Automated breaking-change detection via OpenAPI spec diffing
  - `scripts/check-api-breaking.mjs` — structural diff against baseline (default: `main` branch)
  - Detects: removed paths/methods, added required fields/params, removed response codes, changed operationIds
  - Outputs `ripple-api-breaking/v1` JSON report
  - Wired into `pnpm verify` (10th gate) and release workflow
  - Error taxonomy: RPL-API-002 (breaking) updated, RPL-API-003 (non-breaking) added
- [x] Portal publication pipeline deferred — spec committed at `docs/api/openapi.json` is the publication artifact; infrastructure target (Backstage, S3, SwaggerUI) deferred to follow-up when external integrators are onboarded

**Deferred to follow-up:**
- Portal publication infrastructure (Phase 4b) — target TBD based on integrator needs
- SDK generation from OpenAPI spec — deferred until consumer demand exists

**Verification:** `pnpm verify` passes (10/10 gates); `pnpm test` passes (22 new contract tests + 32 existing); `pnpm check:api-breaking -- --json` emits valid `ripple-api-breaking/v1` JSON; release workflow includes breaking-change gate; error taxonomy v1.10.0 with 62 codes.

---

## Next (6–12 weeks)

> Items planned for the near term. Dependencies understood, design work may be needed.

### RN-028: Golden-Path Conformance CLI

**Impact:** Very High | **Effort:** High | **Risk:** Medium
**Source:** AI Principal Engineer review

One command that scores repos against required standards and auto-opens
remediation PRs. Builds on fleet governance ([RN-024](./ARCHIVE.md#rn-024-fleet-update-mechanism--template-drift-automation)).

- [ ] Define scoring rubric based on minimal repo standards
- [ ] Build CLI tool (`ripple-conform` or `pnpm conform`)
- [ ] Implement auto-remediation PR generation
- [ ] Integrate into fleet drift detection

---

## Later (Quarter+)

> Strategic items without a committed timeline.

### RN-017: Live Drupal Integration Testing

**Impact:** Medium | **Effort:** Medium | **Risk:** Medium
**Status:** Blocked — awaiting live Drupal/Tide URLs from content team.
**Continues:** [RN-004](./ARCHIVE.md#rn-004-drupaltide-cms-integration-ripplecms)

Integration test with a real Drupal/Tide instance to validate DrupalCmsProvider.
**Fallback:** Docker-based Tide fixture if not unblocked by Q2 2026.

- [ ] Set up test Drupal instance (Docker-based or hosted)
- [ ] Write integration test suite exercising all CMS provider methods
- [ ] Add CI job that runs integration tests on schedule (not every PR)

---

## Parked / Not Doing

| Item | Reason |
|------|--------|
| Visual regression (Chromatic/Percy) | Deferred in [RN-020](./ARCHIVE.md#rn-020-storybook-stories-for-tide-components). Not justified by current UI churn. |

---

## Risks & Unknowns

| Risk | Mitigation |
|------|------------|
| RN-017 blocked on content team indefinitely | Docker Tide fixture as fallback by Q2 2026 |
| ~~API boundary undecided (oRPC vs tRPC)~~ | ~~RN-051 (P0)~~ **Resolved** — ADR-021 selects oRPC with OpenAPI-first contracts |
| ~~API layer "partial" status~~ | ~~RN-046 in Now addresses this~~ **Resolved** — oRPC migration complete, 16/16 subsystems implemented |
| ~~Auth integration test gap~~ | ~~RN-045~~ **Resolved** — Keycloak Testcontainer integration tests added |
| No runtime monitoring/alerting | Evaluate when production deployment is imminent; needs ADR |
| ~~`@main` refs in downstream workflow examples~~ | ~~RN-048 in Now addresses this~~ **Resolved** (v6.1.0) |
| ~~Licensing drift (RN-049)~~ | ~~PolyForm Noncommercial 1.0.0 adopted (PR #49)~~ **Resolved** — SPDX `license` field added to all `package.json` files; dual-license model documented |

---

## AI Agent Suggestions

> AI agents propose new items here using the template below. Suggestions are
> triaged during periodic reviews. **Do not self-triage into active sections.**

### Template

```markdown
#### RN-XXX: Short Descriptive Title

**Category:** `[New Item]` | `[Priority Change]` | `[Risk Flag]` | `[Removal]`
**Source:** Agent type and analysis context
**Date:** YYYY-MM-DD
**Impact:** Low | Medium | High | Very High
**Effort:** Low | Medium | High
**Risk:** Low | Medium | High
**AI-first benefit:** One sentence explaining how this helps AI agent workflows

Description with rationale and evidence.

**Affected items:** RN-XXX, RN-YYY (if applicable)
**Proposed action:** What should happen

Checklist (if `[New Item]`):
- [ ] Task 1
- [ ] Task 2
```

### Open AI Suggestions

_No open suggestions. All previous suggestions triaged into active roadmap (v6.0.0)._

---

## Tech Lead Suggestions

> Human tech leads propose changes here. AI agents MUST read but MUST NOT modify.

### Template

```markdown
#### [Category] Short Title
**Author:** @yourname | **Date:** YYYY-MM-DD

Description, rationale, and evidence.

**Affected items:** RN-XXX, RN-YYY (if applicable)
**Proposed action:** What should happen
```

### Open Suggestions

_No open suggestions._

---

## Archive (Done)

50 items completed (RN-001 through RN-052, excluding RN-017/028).
See **[ARCHIVE.md](./ARCHIVE.md)** for full details.

Cross-references: [ADR index](../adr/README.md) | [Readiness](../readiness.json) | [Architecture](../architecture.md)
