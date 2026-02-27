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
| Drop Lucia, use raw JWTs                     | **Disagree**            | Lucia provides the session abstraction layer cleanly. The provider pattern means consumers never touch Lucia directly — they call `AuthProvider.createSession()`. If Lucia truly becomes unmaintained, swapping the implementation behind the interface is a one-file change. That's the whole point of the provider pattern. |
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

## Related Documentation

- [Architecture](./architecture.md) — system overview
- [ADR-007: Library vs Monorepo](./adr/007-library-vs-monorepo.md) — the key decision from this evaluation
- [Provider Pattern](./provider-pattern.md) — core pattern discussed in critiques
- [Testing Guide](./testing-guide.md) — testing approach referenced in critiques
- [Deployment Guide](./deployment.md) — deployment pipeline and CI discussed here
