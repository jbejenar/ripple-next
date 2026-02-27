# ADR-012: Environment Schema Validation Gate

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** Environment validation was limited to presence checks in `scripts/doctor.sh`. Invalid env vars (wrong protocol, malformed URLs) were only caught at runtime, causing confusing failures during development and CI.

## Context

The `.env.example` file documents the full environment contract, and `pnpm doctor`
checks for the presence of key variables. However:

1. **No format validation** — A `DATABASE_URL` set to `mysql://...` passed the
   presence check but failed at runtime with cryptic Drizzle/pg errors.
2. **No structured diagnostics** — Agents and CI could not programmatically determine
   which env vars were misconfigured without parsing human-readable output.
3. **No schema reuse** — The validation logic was duplicated between doctor.sh (bash
   presence checks) and potential future runtime config validation.

## Decision

### 1. Zod-based env schema in `@ripple/validation`

Add `packages/validation/schemas/env.ts` with Zod schemas for all environment
variables defined in `.env.example`:

- **`requiredEnvSchema`** — `DATABASE_URL`, `NUXT_DATABASE_URL`, `REDIS_URL` must be
  present and correctly formatted (postgres://, redis://).
- **`optionalEnvSchema`** — OIDC, CMS, SMTP, storage vars validated when present.
- **`validateEnv()`** — Returns structured `{ valid, passed, failed, warnings }`.

### 2. Standalone validation script

Add `scripts/validate-env.mjs` — a zero-dependency script (no zod import, mirrors
the schema rules in plain JS) that can run before `pnpm install` completes:

- `pnpm validate:env` — human-readable output
- `pnpm validate:env --json` — machine-readable JSON for agents/CI

### 3. Integration points

- **`pnpm doctor`** — calls `validate-env.mjs --json` and reports results alongside
  other environment checks. Falls back to basic presence checks if the script fails.
- **CI test job** — `validate:env` runs in the CI test job (`.github/workflows/ci.yml`)
  where database and Redis services are available, since the required env vars
  (`DATABASE_URL`, `NUXT_DATABASE_URL`, `REDIS_URL`) need to be set.
- **Programmatic use** — Applications and tests import `validateEnv()` from
  `@ripple/validation` for runtime env checking with full Zod schema.

### 4. SBOM generation made mandatory

As part of the same improvement pass, `continue-on-error: true` was removed from the
SBOM generation step in `.github/workflows/release.yml`. SBOM and build provenance
are now fail-fast — a release cannot proceed if supply-chain attestations fail.

### 5. Unified CI test entrypoint

The test composite action (`.github/actions/test/action.yml`) was updated to use a
single `pnpm test:ci` invocation with optional coverage flags, eliminating the
separate coverage generation step that could drift from the canonical test command.

## Consequences

**Positive:**
- Invalid env vars caught at bootstrap time with actionable error messages
- Agents get structured JSON diagnostics for automated remediation
- CI catches env misconfigurations before tests run
- Schema lives alongside other Zod schemas in `@ripple/validation`
- SBOM failures now block releases (stronger supply-chain guarantee)

**Negative:**
- Two copies of validation logic: Zod schema (for programmatic use) and plain JS
  script (for zero-dependency bootstrap). These must be kept in sync manually.

**Trade-off:**
The plain JS duplication was chosen over requiring zod at the root level because:
- The validate-env script must work immediately after `pnpm install` (before builds)
- pnpm strict isolation means zod is only available within `@ripple/validation`
- Adding zod as a root devDependency would weaken the dependency boundary discipline
