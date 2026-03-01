# CI Gate Classification

> Every CI gate is either **blocking** (fails the pipeline) or **advisory**
> (produces artifacts but does not fail the pipeline). No gate may be silently
> suppressed without classification here.
>
> See [RN-053](product-roadmap/README.md#rn-053-ci-gate-truth--enforce-or-explicitly-label-advisory-gates)
> for rationale.

## Blocking Gates

These gates fail the CI pipeline on violation. They run in the `quality` and
`test` jobs.

| Gate | Workflow | Command |
|------|----------|---------|
| Lint | `ci.yml` → quality, `reusable-quality.yml` | `pnpm lint` |
| Typecheck | `ci.yml` → quality, `reusable-quality.yml` | `pnpm typecheck` |
| Env schema validation | `ci.yml` → test | `pnpm validate:env` |
| Unit tests | `ci.yml` → test | `pnpm test:ci` |
| Readiness drift guard | `reusable-quality.yml` | `pnpm check:readiness` |
| Quarantine policy check | `reusable-quality.yml` | `pnpm check:quarantine` |
| IaC policy scan | `ci.yml` → iac-policy (infra changes only) | `pnpm check:iac -- --ci` |
| E2E tests | `ci.yml` → e2e (high-risk/merge only) | `pnpm test:e2e` |
| Devcontainer validation | `ci.yml` → devcontainer (`.devcontainer/`, `.nvmrc`, `package.json` changes) | `docker build` + smoke tests (Node version, pnpm, tools) |

## Advisory Gates

These gates produce artifacts for observability but do not fail the pipeline.
Each uses `|| true` or runs in a non-blocking context. The `|| true` is
intentional and documented here.

| Gate | Workflow | Why advisory |
|------|----------|-------------|
| Gate summary artifact | `ci.yml:quality` | Redundant — individual gates already ran as blocking steps. This step only generates a combined JSON artifact for dashboards. |
| Accessibility audit | `ci.yml:e2e` | Depends on a running app instance; environment constraints may cause false failures. Tracked via `a11y-report.json` artifact. Promote to blocking when environment is stable. |
| Performance audit | `ci.yml:e2e` | CI environment variance makes scores non-deterministic. Tracked via `perf-report.json` artifact. Promote to blocking when baseline is established. |

## Local Verification

`pnpm verify` is the authoritative local gate. It runs 10 gates with no
`|| true` suppression. Any local gate failure exits non-zero.

## Promoting Advisory to Blocking

To promote an advisory gate:

1. Remove `|| true` from the workflow step
2. Move the entry from Advisory to Blocking in this file
3. Verify the gate passes consistently in CI (check last 10 runs)
4. Update the scorecard in `docs/product-roadmap/README.md`
