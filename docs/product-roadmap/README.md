# Ripple Next — Product Roadmap

> v6.5.0 | 2026-03-01
>
> **AI-first platform.** Every item is machine-parseable (`RN-XXX`), includes
> AI-first benefit rationale, and is organised by time horizon for execution
> clarity. Supersedes the tier system ([ADR-016](../adr/016-roadmap-reorganisation.md))
> with Now/Next/Later planning.
>
> 47 items completed. See **[ARCHIVE.md](./ARCHIVE.md)**.

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
    RN-052 Bidirectional fleet comms        :active, rn052, 2026-03-01, 21d

    section Next (6–12 weeks)
    RN-050 Web performance budgets          :rn050, 2026-04-13, 21d
    RN-025 Contract testing                 :rn025, 2026-05-04, 30d
    RN-028 Golden-path conformance CLI      :rn028, 2026-05-04, 30d

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

1. **Production confidence** — ~~execute oRPC migration (ADR-021)~~ done, ~~close integration test gaps~~ OIDC integration tested (RN-045)
2. **Fleet adoption** — contract testing, conformance CLI, CI speed, deterministic pinning
3. **Quality depth** — performance budgets, live CMS validation
4. **Bidirectional fleet governance** — downstream→upstream feedback, AI instruction sync, version tracking, update notifications (ADR-022, RN-052)

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

### RN-052: Bidirectional Fleet Communication (Downstream↔Upstream)

**Impact:** Very High | **Effort:** High | **Risk:** Medium | **Priority:** P0
**Source:** Tech-lead directive — fleet governance gap analysis | **Date:** 2026-03-01
**ADR:** [ADR-022](../adr/022-bidirectional-fleet-communication.md)
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

## Next (6–12 weeks)

> Items planned for the near term. Dependencies understood, design work may be needed.

### RN-050: Web Performance Budgets (Lighthouse CI)

**Impact:** Medium | **Effort:** Medium | **Risk:** Low
**Source:** Gap analysis — a11y auditing exists ([RN-042](./ARCHIVE.md#rn-042-accessibility-audit-pipeline)) but no performance equivalent
**AI-first benefit:** Agents get structured performance regression signals in CI.

Government sites have performance obligations. The platform has WCAG a11y auditing
but no Core Web Vitals monitoring. Lighthouse CI provides the performance analog.

- [ ] Define performance budgets (LCP, CLS, INP thresholds)
- [ ] Lighthouse CI integration in CI pipeline
- [ ] Emit structured `ripple-perf-report/v1` JSON
- [ ] Block on critical performance regressions

**Verification:** `pnpm test:perf -- --json` emits valid JSON; CI includes performance job; `pnpm verify` passes.

---

### RN-025: Contract Testing Across Consumers

**Impact:** High | **Effort:** High | **Risk:** Medium
**Source:** AI Principal Engineer review
**Depends on:** [RN-046](#rn-046-orpc-migration--router-integration-harness-testcontainers) (completed — `docs/api/openapi.json` available)

Formal compatibility contract testing across published `@ripple/*` package
consumers. Uses the OpenAPI spec from ADR-021 as the contract format.
Now actionable — oRPC migration (RN-046) generated `docs/api/openapi.json`.

- [ ] Define contract test patterns for package consumers (OpenAPI-based)
- [ ] Integrate consumer contract tests into release workflow
- [ ] Automated breaking-change detection via OpenAPI spec diffing
- [ ] Portal publication pipeline (Phase 4 of ADR-021)

---

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
| RN-049: Licensing Clarity Guardrail | PolyForm Noncommercial 1.0.0 adopted (PR #49). Contradicts prior SPDX-standard guidance — needs ADR to document rationale. |
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
| Licensing drift (RN-049) | PolyForm Noncommercial 1.0.0 adopted (PR #49) — diverges from prior SPDX-standard guidance; needs ADR |

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

47 items completed (RN-001 through RN-051, excluding RN-017/025/028/052).
See **[ARCHIVE.md](./ARCHIVE.md)** for full details.

Cross-references: [ADR index](../adr/README.md) | [Readiness](../readiness.json) | [Architecture](../architecture.md)
