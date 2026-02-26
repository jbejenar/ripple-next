# ADR-007: Keep Monorepo, Publish Shared Packages as Libraries

**Date:** 2026-02-26
**Status:** Accepted
**Deciders:** Architecture team
**Context:** Evaluation of critique feedback re: multi-team scale, upgrade friction, and redeployment costs.

## Context

We have two competing models for scaling ripple-next across many projects and teams:

1. **Stay pure monorepo** — all projects in one repo, workspace:* links everywhere.
2. **Extract to published libraries** — publish `@ripple/*` packages to a private registry, each project installs them like any npm dependency.
3. **Hybrid** — keep the monorepo as the development hub, but publish stable packages to a private registry so external projects can consume them independently.

### Constraints

- Many teams, many projects, many concurrent builds.
- Must be super low friction — upgrades can't require coordinated redeployments.
- AI agents are primary developers — they need clear, bounded contexts.
- Government-grade reliability — changes to shared infra can't silently break consumers.

## Decision

**Hybrid approach: monorepo for development, published packages for consumption.**

### How It Works

1. **This monorepo** (`ripple-next`) remains the **source of truth** for all `@ripple/*` packages.
2. Core infrastructure packages (`@ripple/auth`, `@ripple/queue`, `@ripple/storage`, `@ripple/email`, `@ripple/events`, `@ripple/db`, `@ripple/shared`, `@ripple/validation`, `@ripple/ui`, `@ripple/testing`) are **published to a private npm registry** (GitHub Packages or AWS CodeArtifact) on release.
3. **Consumer projects** (other teams' apps/services) install published versions: `"@ripple/auth": "^0.2.0"` — not workspace links.
4. **This monorepo's own apps/services** (`apps/web`, `services/*`) continue using `workspace:*` for instant feedback during development.
5. Each package follows **semver** — breaking changes bump major, new features bump minor, fixes bump patch.
6. Consumers **upgrade at their own pace** — `pnpm update @ripple/auth` when ready. No coordinated redeployment needed.

### Why Not Pure Library?

- Splitting into separate repos per package creates a maintenance nightmare — cross-package changes require coordinated PRs across 10+ repos.
- Monorepo keeps the tight feedback loop agents need: change a provider interface → see all downstream breakage instantly.
- Turborepo's dependency graph ensures only affected packages rebuild/retest.

### Why Not Pure Monorepo?

- With "a huge amount of projects and many teams," you can't fit every team's app in one repo.
- Monorepo-only means every team's build runs against HEAD — a breaking change in `@ripple/auth` breaks all teams simultaneously.
- No version pinning means no upgrade control.

### Why Hybrid Wins

| Concern | Pure Monorepo | Pure Library (split repos) | Hybrid |
|---|---|---|---|
| Cross-package refactoring | Instant | Multi-repo coordination | Instant (in monorepo) |
| Consumer upgrade control | None (always HEAD) | Full (semver) | Full (semver) |
| Build isolation | Shared CI load | Independent | Independent for consumers |
| Agent context window | One big repo | Many small repos | Bounded packages |
| Redeployment on upgrade | Everyone redeploys | Each team decides | Each team decides |
| Breaking change detection | Immediate in CI | Only when consumer upgrades | Immediate in monorepo, controlled for consumers |

## Consequences

### Positive
- Teams upgrade `@ripple/*` packages independently — no forced redeployments.
- Breaking changes are caught in the monorepo CI before publishing.
- Consumers can pin versions and upgrade when ready.
- The monorepo remains the single development environment with fast iteration.

### Negative
- Need to set up a publish pipeline (CI job on tag/release).
- Need semver discipline — every package change must be classified as patch/minor/major.
- Changelog generation becomes important for consumers.

### Implementation Requirements
- Add `publishConfig` to each package's `package.json` pointing to private registry.
- Add a `release` CI workflow that builds, tests, and publishes tagged packages.
- Add changesets or similar tool for version management.
- Each package needs a proper `dist/` build output (not raw .ts).

## Alternatives Considered

### Nx-style affected-only builds
Would help with monorepo-only scaling but doesn't solve the "many separate projects" problem. Turborepo already provides affected-only caching.

### Git submodules
Worst of both worlds. Hard for agents to navigate, merge conflicts everywhere, no version pinning semantic.

### Copy-paste / vendoring
Anti-pattern. Leads to drift across teams.
