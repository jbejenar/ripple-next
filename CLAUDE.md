<!-- This file is intentionally minimal (~40 lines). See ADR-020.
     Only add content that prevents CI failures if unknown.
     Domain-specific guidance belongs in .github/instructions/. -->

# CLAUDE.md

## Validate Changes

Run `pnpm verify` after changes — runs all quality gates (lint, typecheck, test, readiness).

## Lint Rules (Strict)

- `no-console` is an **error** (use `console.warn`/`console.error` if needed)
- `@typescript-eslint/no-explicit-any` is an **error** (use `unknown` + type guards)
- Test files and `migrate.ts`/`seed.ts`/`*.handler.ts` are exempt from no-console

## Nuxt Auto-Imports

Do NOT add manual imports for: `ref`, `computed`, `watch`, `onMounted`, `useRoute`,
`useRouter`, `useFetch`, `useState`, `navigateTo`, `definePageMeta`,
`defineEventHandler`, `getQuery`, `readBody`, `createError`, `setResponseStatus`.

DO manually import: anything from `@ripple/*` packages, `node_modules`, tRPC utilities.

## Provider Pattern

Every infrastructure concern uses a provider interface. Tests ALWAYS use
memory/mock providers — never cloud services. New providers must pass the
conformance suite from `packages/testing/conformance/`.

## Coverage Thresholds (never lower)

- **Tier 1** (auth, db, queue): 60% lines/functions/statements, 50% branches
- **Tier 2** (cms, email, storage, events, validation): 40%/30%
- **Tier 3** (UI, services): 20%/10%

## Infrastructure

SST v3 (Pulumi) — NOT CDK, NOT CloudFormation. Lambda is default compute.
Use SST Resource linking (`import { Resource } from 'sst'`) — never hardcode ARNs or URLs.
