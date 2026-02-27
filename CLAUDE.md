# CLAUDE.md — Claude Code Configuration

## Quick Start

```bash
pnpm bootstrap       # install + doctor + validate (first-time setup)
pnpm doctor          # validate environment
pnpm install         # install deps (if doctor passes)
pnpm test            # run all tests
pnpm lint            # lint all packages
pnpm typecheck       # type check all packages
pnpm check:readiness # verify readiness.json is not stale
```

## Project Overview

Full-stack government digital platform. Hybrid monorepo — `@ripple/*` packages
are published to a private npm registry. See `AGENTS.md` for full architecture.

## Key Files for Agent Planning

- `docs/readiness.json` — machine-readable subsystem status (check before starting work)
- `docs/product-roadmap/` — product roadmap, agent-friction scorecard, improvement phases
- `AGENTS.md` — architecture, conventions, validation requirements
- `vitest.workspace.ts` — test suites with risk-tiered coverage thresholds
- `.changeset/config.json` — version management config
- `.env.example` — environment variable contract with defaults

## Before Making Changes

1. Read `docs/readiness.json` to understand subsystem status
2. Run `pnpm doctor` to validate the environment
3. Check `AGENTS.md` → "Agent Task Routing" for required validation per change type

## After Making Changes

1. `pnpm test` — all tests must pass
2. `pnpm lint` — zero errors (no-console is an error, not a warning)
3. `pnpm typecheck` — zero type errors
4. `pnpm check:readiness` — manifest must not drift
5. If you changed a published package's API: `pnpm changeset` to add version intent

## Provider Pattern (Critical)

Every infrastructure concern uses a provider interface. Tests ALWAYS use memory/mock providers.

When implementing a new provider:
1. Implement the interface from `packages/<concern>/types.ts`
2. Run the conformance suite from `packages/testing/conformance/`
3. All conformance tests must pass before the provider is considered done

Example:
```ts
import { queueConformance } from '@ripple/testing/conformance/queue.conformance'
import { MyNewQueueProvider } from './my-provider'

queueConformance({
  name: 'MyNewQueueProvider',
  factory: () => new MyNewQueueProvider(config),
})
```

## Coverage Thresholds (Enforced)

- **Tier 1** (auth, db, queue): 60% lines/functions/statements, 50% branches
- **Tier 2** (email, storage, events): 40% lines/functions/statements, 30% branches
- **Tier 3** (UI, services): 20% lines/functions/statements, 10% branches

Never lower a threshold — only raise it.

## Lint Rules (Strict)

- `no-console` is an **error** (use `console.warn`/`console.error` if needed)
- `@typescript-eslint/no-explicit-any` is an **error** (use `unknown` + type guards)
- Test files and `migrate.ts`/`seed.ts`/`*.handler.ts` are exempt from no-console

## Nuxt Auto-Imports

Do NOT add manual imports for: `ref`, `computed`, `watch`, `onMounted`, `useRoute`,
`useRouter`, `useFetch`, `useState`, `navigateTo`, `definePageMeta`,
`defineEventHandler`, `getQuery`, `readBody`, `createError`, `setResponseStatus`.

DO manually import: anything from `@ripple/*` packages, `node_modules`, tRPC utilities.
