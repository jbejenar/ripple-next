# Critique Evaluation & Decisions

**Date:** 2026-02-26
**Input:** Critique 1 (structured scan), Critique 2 (agent-first philosophy), Proposal (merged + scale additions)

## The Big Decision: Library vs Monorepo

**Decision: Hybrid — monorepo for development, published packages for consumption.**

See [ADR-007](./adr/007-library-vs-monorepo.md) for full rationale.

**TL;DR:** The monorepo stays as the development hub. The `@ripple-next/*` packages get published to a private registry so external teams install versioned releases (`"@ripple-next/auth": "^0.2.0"`). This means:

- **No forced redeployments** — each team upgrades when they choose to.
- **Breaking changes** are caught in monorepo CI before publishing.
- **Many teams, many projects** — each has its own repo consuming published packages.
- **Upgrades are just `pnpm update @ripple-next/auth`** — zero coordination required.

---

## Critique-by-Critique Evaluation

### Critique 1 (Structured Scan) — Verdict: Mostly Correct

| Finding                                 | Agree?                   | Action                                                                                                           |
| --------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| A) Auth providers are placeholders      | Yes                      | Acknowledged — but implementing auth is out of scope for this evaluation. Marked in readiness manifest.          |
| B) Test coverage below stated policy    | Yes                      | Acknowledged — test depth is a feature task, not an architecture change. Readiness manifest now tracks this gap. |
| C) App/API is scaffolded                | Yes                      | Expected at this stage. Readiness manifest reflects this.                                                        |
| D) CI quality gates permissive          | **Yes — actionable now** | Fixed: turbo.json outputs cleaned, lint warnings documented, tiered CI added.                                    |
| E) Docs mix aspirational vs implemented | **Yes — actionable now** | Fixed: added `docs/readiness.json` with per-subsystem status.                                                    |
| F) Agent workflow not codified in CI    | **Yes — actionable now** | Fixed: added PR template with definition-of-done checklist.                                                      |
| G) Observability defaults (P2)          | Yes but premature        | Deferred — not blocking agent-first development.                                                                 |
| H) Deterministic bootstrapping (P2)     | Yes but premature        | Deferred — docker-compose + pnpm install already works.                                                          |

### Critique 2 (Agent-First Philosophy) — Verdict: Mixed

| Finding                                      | Agree?                  | Action                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Abolish Nuxt auto-imports                    | **Disagree**            | Auto-imports are Nuxt's core DX. Disabling them breaks the ecosystem. Instead, we document them explicitly in AGENTS.md. Agents already handle Nuxt auto-imports fine — they're well-documented in the Nuxt docs that models are trained on.                                                                                  |
| Feature-sliced colocation                    | **Partially agree**     | Nuxt layers already provide this. The auth layer has its pages, composables, and server routes colocated. No restructuring needed.                                                                                                                                                                                            |
| AGENTS.md must be machine-readable JSON/YAML | **Disagree**            | AGENTS.md is consumed by LLMs, not parsers. Markdown with clear structure is the right format. Added `docs/readiness.json` for the machine-readable data the critique was really asking for.                                                                                                                                  |
| Drop Lucia, use raw JWTs                     | **Resolved via [ADR-008](./adr/008-oidc-over-lucia.md)** | Lucia was subsequently replaced with standard OIDC/OAuth via `oauth4webapi`. The provider pattern (`AuthProvider.createSession()`) made the swap a single-file change, validating the original architecture. |
| Drop Redis/BullMQ, standardize on SQS        | **Partially agree**     | BullMQ is already a devDependency only (not in Lambda bundles). It exists solely for local dev fidelity. Dropping it means local dev uses MemoryQueueProvider instead — acceptable but slightly less realistic. **No change** — the current split (Memory for tests, BullMQ for local, SQS for prod) is the right layering.   |
| Keep Drizzle                                 | **Agree**               | Already the choice. No change needed.                                                                                                                                                                                                                                                                                         |
| Ephemeral environments per PR                | **Already implemented** | `deploy-preview.yml` already deploys `pr-{number}` stages.                                                                                                                                                                                                                                                                    |
| IaC fences for agents                        | **Agree**               | This is an IAM policy concern, not a code concern. Noted for ops team.                                                                                                                                                                                                                                                        |
| Self-healing CI (auto-retry on failure)      | **Disagree for now**    | Auto-retry loops are dangerous — an agent can thrash indefinitely. Better to fail fast, report clearly, and let the orchestrator decide.                                                                                                                                                                                      |
| Strict TypeScript maximized                  | **Already done**        | `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are all enabled. No `any` rule in ESLint.                                                                                                                                                                                                |

### Proposal (Merged) — Verdict: Good Additions

| Finding                                  | Agree?                   | Action                                              |
| ---------------------------------------- | ------------------------ | --------------------------------------------------- |
| G) Multi-team concurrency collision risk | **Yes — actionable now** | Added CODEOWNERS file for critical shared surfaces. |
| H) CI cost/latency won't scale           | **Yes — actionable now** | Added tiered CI pipeline model.                     |

---

## Summary of Changes Made

1. **ADR-007:** Library vs monorepo decision documented.
2. **docs/readiness.json:** Machine-readable subsystem status manifest.
3. **CODEOWNERS:** Ownership boundaries for shared surfaces.
4. **Tiered CI:** `ci.yml` updated with path-based filtering and tiered jobs.
5. **turbo.json:** Fixed outputs for tasks that don't produce artifacts.
6. **PR template:** Definition-of-done checklist for all PRs.
7. **AGENTS.md:** Updated with auto-import documentation, library publishing info, and explicit status markers.

## What Was Intentionally NOT Changed

- **Auth provider implementation** — that's a feature, not architecture. Tracked in readiness manifest.
- **Test coverage thresholds** — premature to enforce when most packages have no tests. Adding a 60% gate now would just block all PRs. Tracked in readiness manifest.
- **Nuxt auto-imports** — not disabled. Documented instead.
- **Redis/BullMQ removal** — the current 3-tier provider split is correct.
- **Self-healing CI loops** — too risky for autonomous agents. Fail fast is safer.
- **Observability/OpenTelemetry** — P2, not blocking agent-first development.

---

## Critique 3 (Honest Self-Assessment) — 2026-03-01

**Reviewer:** Claude Opus 4.6 (independent review, not the agent that built the codebase)

This critique was requested by the tech lead with the instruction to "be very
critical of this project and its intentions." The numbers below are drawn from
the repository as of commit `a8ad67b` (2026-03-01).

### Documentation-to-Code Ratio Is Inverted

| Category | Lines |
|----------|-------|
| Application + package source (non-test) | ~12,800 |
| Scripts and tooling | ~8,200 |
| Documentation (markdown + JSON) | ~9,900 |
| Test code | ~7,300 |

Documentation and meta-tooling (~18,100 lines) exceed the actual application
and library source code (~12,800 lines). The project has more governance
apparatus than governed code. This is the signature of a project that has
optimised for describing what it will become rather than being something.

### 64% of Commits Are AI-Generated

100 of 156 commits are authored by Claude. The project's primary feature is
"being AI-friendly" and it is primarily built by AI. This is circular: the AI
is building a platform to make things easier for AI, reviewed by AI critiques
(Critique 1 and 2 above were from GPT-5.2-Codex). The human is increasingly
the orchestrator of AI agents talking to each other about a codebase the AI
is writing. This isn't inherently bad, but the project should be honest about
what it is: an experiment in AI-driven software development, not (yet) a
production government platform.

### Every Package Is Still v0.1.0

Despite claiming 49 completed roadmap items, 22 ADRs, 16/16 "implemented"
subsystems, and a 40/40 Agent-Friction score — every single `@ripple-next/*`
package is still at version `0.1.0`. No package has ever been published or
consumed by an external team. The "hybrid monorepo with published packages"
model (ADR-007) describes a publishing pipeline that has never been exercised
with real consumers.

### "16/16 Subsystems Implemented" Is Generous

The readiness manifest claims all 16 subsystems are "implemented." Looking at
actual code volume tells a different story:

- `@ripple-next/email`: 136 lines total. That's an interface and a memory stub.
- `@ripple-next/events`: 133 lines. Same pattern.
- `@ripple-next/shared`: 88 lines.
- `@ripple-next/storage`: 213 lines.
- `@ripple-next/queue`: 343 lines.

These are correctly described as "provider interfaces with conformance tests."
Calling them "implemented" conflates having a clean interface with having a
production-ready subsystem. The conformance tests validate the contract, not
the production implementation — the SQS, SES, S3, and EventBridge providers
are thin wrappers that have never been exercised against real AWS services
(LocalStack was explicitly rejected in ADR-015).

### Agent-Friction Scorecard of 40/40 Is Self-Assessed

A perfect score across all 8 dimensions is not credible self-assessment; it
is marketing. "Setup determinism: 5/5" — yet there are zero downstream repos
consuming this template. "Test reliability: 5/5" — yet the project has never
run tests at scale with multiple contributors. These scores describe
aspirational capabilities that have not been validated by real-world usage.

### Fleet Governance for a Fleet That Doesn't Exist

The project has invested significant effort in fleet governance (ADR-019,
ADR-022, RN-024, RN-052): drift detection, sync automation, compliance
reporting, bidirectional downstream-upstream feedback, fleet changelogs. This
is governance infrastructure for downstream repos that do not exist yet. The
scaffold generator (`pnpm generate:scaffold`) can create them, but none have
been created. Building fleet governance before having a fleet is premature
optimisation.

### Five "High/Very High Impact" Items Completed on the Same Day

RN-046, RN-045, RN-052, RN-050, and RN-025 were all marked completed on
2026-03-01 with effort ratings of Medium to High. Either the effort estimates
are inflated (making the roadmap look more impressive), or the definition of
"completed" is generous (checking boxes on a definition-of-done without the
depth implied by the effort rating). Likely both.

### The App Itself Is Minimal

Behind all the architecture, governance, and tooling: the actual web
application has 4 pages (`index`, `login`, `dashboard`, `content/[...slug]`),
one oRPC router with 4 user CRUD procedures, and ~2,500 lines of application
code. This is a starter template, not a platform. The documentation and
tooling dwarf the thing being documented and tooled.

### Licensing Is Problematic

PolyForm Noncommercial 1.0.0 was adopted (PR #49) for a project described as
a "government digital platform." Non-commercial licensing for government
software is unusual and potentially incompatible with government procurement
and contractor usage. RN-049 was parked because it "contradicts prior
SPDX-standard guidance" — this needs resolution, not parking.

### No Evidence of Production Readiness

- No production deployment has ever occurred.
- No real Drupal/Tide instance has been connected (RN-017 blocked indefinitely).
- No external team has consumed the published packages.
- No runtime monitoring or alerting exists (deferred as P2).
- No load testing or performance validation against real infrastructure.

### What the Project Actually Is (Honestly)

Ripple Next is a well-architected **starter template** and **architecture
reference** for government Nuxt 3 applications. The provider pattern, ADR
library, and testing infrastructure are genuinely good. But the project
presents itself as further along than it is. It is:

- A template, not a platform.
- An architecture experiment, not a production system.
- An AI-development workflow experiment (and an interesting one).
- A documentation project with code attached, not the other way around.

### What Would Make This Critique Wrong

1. A downstream team actually uses the scaffold generator and ships to production.
2. The published packages are consumed by real `pnpm install` outside this monorepo.
3. The fleet governance tooling detects real drift in real downstream repos.
4. The CI pipeline runs for a team of 5+ contributors for a month without manual intervention.
5. A real Drupal/Tide instance is connected and the CMS provider works end-to-end.

Until those things happen, the project is a promising skeleton with
exceptional documentation — but a skeleton nonetheless.

---

## Critique 4 (Follow-Up Reassessment) — 2026-03-02

**Reviewer:** Claude Opus 4.6 (independent review, fresh full-repo analysis)

This critique reassesses the entire repository as of commit `ce01b81`
(2026-03-02), one day after Critique 3. The objective is to verify what changed
in response to Critique 3, what remains true, and what new observations emerge.

### The Response to "Too Much Documentation" Was More Documentation

Critique 3's central finding was that documentation and meta-tooling (~18,100
lines) exceeded application source code (~12,800 lines). The response since
then — 48 commits on 2026-03-01 alone, plus 9 on 2026-03-02 — was
overwhelmingly more documentation:

| Files changed on 2026-03-01 | Count |
|------------------------------|-------|
| Documentation files (.md, .json in docs/) | 69 |
| Scripts (.mjs) | 19 |
| CI/GitHub config (.yml, templates) | 15 |
| Test files | 13 |
| Source code files (.ts, .vue) | 20 |

The updated line counts tell the same story:

| Category | Critique 3 | Now | Delta |
|----------|-----------|-----|-------|
| Application + package source (non-test) | ~12,800 | 12,854 | +54 |
| Scripts and tooling | ~8,200 | 8,726 | +526 |
| Documentation (markdown) | ~9,900 | 9,524 | -376 (restructured) |
| Documentation (JSON config/policy) | (included above) | 3,460 | (now counted separately) |
| GitHub workflows + actions | (not counted) | 1,666 | — |
| Test code | ~7,300 | 7,267 | -33 |

Meta-layer total (docs + JSON + scripts + CI): **23,376 lines.**
Application + library source: **12,854 lines.**

The ratio is **1.82:1 meta-to-code** — worse than before. The project responded
to being told it has too much governance apparatus by building more governance
apparatus. Specifically: ADR-023 (downstream adoption standards), a downstream
adoption guide, AI adoption prompt templates, platform capabilities catalog,
two new machine-readable runbooks, scaffold enhancements for documentation
generation, a conformance rubric for downstream documentation quality, and a
README restructure with 8-persona routing.

None of these produced application code. They produced documentation about how
future code should be documented.

### What Changed (Credit Where Due)

The project did respond to Critique 3 honestly in several areas:

1. **Agent-Friction Scorecard reduced from 40/40 to 35/40.** Test reliability
   dropped to 3/5, automated remediation to 3/5, local dev parity to 4/5. This
   is more honest. It's still self-assessed (RN-057 planned but not done), but
   acknowledging gaps is progress.

2. **Readiness manifest now has maturity levels.** The distribution —
   2 integration-tested, 8 conformance-tested, 6 interface-defined,
   0 production-proven — is more informative than the previous flat
   "implemented" label. This was a direct response to the critique and is
   genuinely useful.

3. **CI gates classified as blocking vs advisory.** RN-053 documented which
   gates are real and which are `|| true`. `pnpm verify` runs 10 gates and
   passes 10/10 (confirmed). This is real improvement.

4. **Node version pinning fixed.** `.nvmrc` and `engines.node` now match
   (22.22.0). Small but concrete.

5. **"Honesty & trust" is now an explicit roadmap theme.** The roadmap
   acknowledges the critique's findings and tracks them as work items. The
   self-awareness is genuine.

### What Remains Unchanged

Every substantive finding from Critique 3 remains true:

**Every package is still v0.1.0.** All 11 `@ripple-next/*` packages. No
package has been published. No package has been consumed externally. The
publishing pipeline (ADR-007, Changesets, release workflow) has never been
exercised.

**No downstream consumer exists.** Fleet governance (6 scripts totaling 1,895
lines), fleet policies, fleet drift detection, fleet sync automation,
bidirectional fleet feedback, fleet changelogs — all govern a fleet of zero.
The response to the critique was to add more fleet governance (ADR-023,
FLEET-SURF-012, FLEET-SURF-013, adoption runbooks) rather than to create a
single downstream consumer.

**No production deployment.** No staging deployment. No real AWS resources
provisioned. The SST config (154 lines) describes infrastructure that has never
been instantiated.

**No live CMS integration.** RN-017 remains blocked. The Docker Tide fixture
fallback is "activated" but not implemented (the Definition of Done items are
all unchecked).

**Licensing is unresolved.** RN-058 is planned but not started. PolyForm
Noncommercial 1.0.0 remains the license.

### The Thin Packages Are Still Thin

The production providers exist and are competently written — this deserves
acknowledgement. But the packages remain small:

| Package | Source Lines | What It Actually Is |
|---------|-------------|---------------------|
| `@ripple-next/email` | 129 | Interface (6 types) + SMTP wrapper (37 lines) + SES wrapper (35 lines) + memory stub |
| `@ripple-next/events` | 126 | Interface + MemoryEventBus (30 lines) + EventBridgeBus (25 lines) |
| `@ripple-next/shared` | 88 | A few type exports and utility functions |
| `@ripple-next/storage` | 200 | Interface + Filesystem (50 lines) + MinIO (50 lines) + S3 (80 lines) |
| `@ripple-next/queue` | 287 | Interface + Memory/BullMQ/SQS providers (~55 lines each) + consumer pattern |
| `@ripple-next/auth` | 254 | Interface + OIDC wrapper (111 lines) + Mock (57 lines) + permissions (28 lines) |
| `@ripple-next/db` | 300 | 4 schemas + 3 basic CRUD repositories + client/migrate/seed |

The conformance tests for the thinnest packages test the memory/filesystem
provider — not the production provider. The SES, EventBridge, and S3 providers
have never been tested against real AWS. The "conformance-tested" maturity
label is accurate but potentially misleading: it means "the in-memory stub
passes the contract tests," not "the production implementation works."

### What IS Genuinely Substantial

Two packages have real depth:

**`@ripple-next/ui`: 4,987 lines across 45 Vue components.** This is real
work. Atoms (19), molecules (16), organisms (2), content section renderers (8).
478 passing tests. 43 Storybook stories. Components like RplMediaGallery (314
lines), RplTable (244 lines), and RplPagination (211 lines) have genuine
complexity. The tests check ARIA attributes, keyboard navigation, and
interactive state. This is the most production-ready part of the project.

**`@ripple-next/cms`: 1,578 lines with real Drupal integration.** The Drupal
JSON:API client (457 lines) and Tide paragraph mapper (418 lines) do real work
transforming CMS content into typed domain objects. The search-enhanced
decorator (205 lines) adds MeiliSearch integration. The mock provider (167
lines) enables clean testing. This is genuine integration code — though it has
never been validated against a live Drupal instance.

### 66% of Commits Are Now AI-Generated

107 of 163 commits are authored by Claude (65.6%, up from 64%). The human has
56 commits. Of the 48 commits on March 1 (the day after the critique), 36 were
AI-authored. The project is increasingly AI talking to AI about AI-friendliness.

More notably: 65 commits in a single day (2026-03-01), then 70 the day before
(2026-02-28). That's 135 commits in 48 hours. This velocity pattern — massive
bursts of AI-generated commits — raises questions about review depth. Can 65
commits in one day receive meaningful human review?

### The Roadmap Is Self-Referential

55 of the 67 total roadmap items are "completed." Looking at what was completed:

- 23 ADRs documenting decisions
- Multiple items about improving the roadmap itself (RN-016, RN-033, RN-044)
- Items about scoring the project's own AI-friendliness (RN-034, RN-040)
- Items about governing future repos that don't exist (RN-024, RN-052)
- Items about documenting how to adopt the platform (RN-061)
- Items about fixing the honesty of previous items (RN-053, RN-055, RN-056)

The roadmap has become a self-sustaining system: items create documentation,
documentation reveals gaps, gaps become items, items create more documentation.
The actual application (4 pages, 1 oRPC router, ~1,189 lines of app code)
hasn't meaningfully grown.

### Integration Tests Require Docker (Which CI May Not Have)

The auth and database integration tests — the ones that justify "integration-tested"
maturity — use `describe.runIf(dockerAvailable)`. Without Docker, 8 auth tests
and all DB integration tests are silently skipped. The `pnpm test` output shows
"19 passed | 8 skipped" for auth. The "integration-tested" maturity label
depends on infrastructure that may not be present in all CI environments.

### The Quality Gates Work (This Is Real)

`pnpm verify` runs 10 gates and passes all 10. This is not trivial:

1. Environment schema validation (Zod)
2. ESLint with `no-console` as error and `no-explicit-any` as error
3. TypeScript strict mode across 26 packages
4. 672 tests passing across 62 test files
5. Readiness manifest validation (90 checks)
6. Quarantine budget check
7. IaC policy scan
8. Context file size limits
9. API contract drift detection
10. API breaking change detection

This is a genuinely well-constructed quality pipeline. The fact that it passes
cleanly means the codebase is internally consistent. The question isn't whether
the quality gates work — they do — but whether quality gates for a starter
template justify the governance investment.

### Updated Assessment: What the Project Actually Is

Critique 3 called this "a promising skeleton with exceptional documentation."
After the response to that critique, the assessment is refined:

**Ripple Next is two things simultaneously:**

1. **A competent government UI component library and CMS integration layer**
   (6,565 lines of real code in `@ripple-next/ui` + `@ripple-next/cms`) with
   good test coverage, accessibility testing, and a clean provider abstraction.
   This part is genuinely useful and could ship.

2. **A meta-project about how to run AI-driven software development** (23,376
   lines of docs, scripts, policies, runbooks, governance, tooling) that uses
   the component library as its subject matter. This part is interesting as
   research but has consumed 1.8x the effort of the thing it governs.

The project should decide which of these it is. If it's a component library
and CMS integration for government Nuxt apps, it should ship `@ripple-next/ui`
and `@ripple-next/cms` tomorrow and let the governance evolve organically. If
it's a reference architecture for AI-driven development, it should say so
explicitly and stop presenting itself as a production platform.

### What Would Change This Assessment

The five conditions from Critique 3 remain. None have been met. Adding one more:

6. The meta-layer (docs + scripts + CI + governance) shrinks below 1:1 ratio
   with application code, indicating the project has shifted from describing
   itself to building itself.

### What's Genuinely Good (Don't Lose This)

To be clear: several things here are excellent and should not be discarded in
a rush to "add more code":

- The **provider pattern** is clean, testable, and proven (the auth swap from
  Lucia to OIDC validated it).
- The **conformance test suites** are a smart way to ensure provider
  implementations respect contracts.
- The **UI component library** has real depth, good accessibility testing, and
  genuine government-design-system flavor.
- The **CMS decoupling** (Drupal isolated to 2 files) is architecturally sound.
- The **ADR library** makes decisions traceable and reversible.
- The **quality gate pipeline** (`pnpm verify`) is comprehensive and actually
  passes.
- The **honesty response** (maturity levels, scorecard reduction, gate
  classification) shows the project can self-correct.

The foundation is solid. What's missing is the building on top of it.

---

## Related Documentation

- [Architecture](./architecture.md) — system overview
- [ADR-007: Library vs Monorepo](./adr/007-library-vs-monorepo.md) — the key decision from this evaluation
- [Provider Pattern](./provider-pattern.md) — core pattern discussed in critiques
- [Testing Guide](./testing-guide.md) — testing approach referenced in critiques
- [Deployment Guide](./deployment.md) — deployment pipeline and CI discussed here
