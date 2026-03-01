# Critique Evaluation & Decisions

**Date:** 2026-02-26
**Input:** Critique 1 (structured scan), Critique 2 (agent-first philosophy), Proposal (merged + scale additions)

## The Big Decision: Library vs Monorepo

**Decision: Hybrid — monorepo for development, published packages for consumption.**

See [ADR-007](./adr/007-library-vs-monorepo.md) for full rationale.

**TL;DR:** The monorepo stays as the development hub. The `@ripple/*` packages get published to a private registry so external teams install versioned releases (`"@ripple/auth": "^0.2.0"`). This means:

- **No forced redeployments** — each team upgrades when they choose to.
- **Breaking changes** are caught in monorepo CI before publishing.
- **Many teams, many projects** — each has its own repo consuming published packages.
- **Upgrades are just `pnpm update @ripple/auth`** — zero coordination required.

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
subsystems, and a 40/40 Agent-Friction score — every single `@ripple/*`
package is still at version `0.1.0`. No package has ever been published or
consumed by an external team. The "hybrid monorepo with published packages"
model (ADR-007) describes a publishing pipeline that has never been exercised
with real consumers.

### "16/16 Subsystems Implemented" Is Generous

The readiness manifest claims all 16 subsystems are "implemented." Looking at
actual code volume tells a different story:

- `@ripple/email`: 136 lines total. That's an interface and a memory stub.
- `@ripple/events`: 133 lines. Same pattern.
- `@ripple/shared`: 88 lines.
- `@ripple/storage`: 213 lines.
- `@ripple/queue`: 343 lines.

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

## Related Documentation

- [Architecture](./architecture.md) — system overview
- [ADR-007: Library vs Monorepo](./adr/007-library-vs-monorepo.md) — the key decision from this evaluation
- [Provider Pattern](./provider-pattern.md) — core pattern discussed in critiques
- [Testing Guide](./testing-guide.md) — testing approach referenced in critiques
- [Deployment Guide](./deployment.md) — deployment pipeline and CI discussed here
