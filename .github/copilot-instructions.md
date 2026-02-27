# Copilot Instructions

This repo uses the provider pattern. When implementing features:

1. Define the interface in `types.ts`
2. Implement the memory/mock provider first (for tests)
3. Implement the real provider
4. Write tests using the memory provider
5. Wire up via dependency injection in server plugins

## Build & Test

- `pnpm test` runs all unit + integration tests via Vitest
- `pnpm test:e2e` runs Playwright browser tests
- `pnpm typecheck` validates all TypeScript types
- `pnpm lint:fix` auto-fixes formatting issues
- Always run ALL FOUR commands before finalizing changes

## Auto-imports

Nuxt auto-imports Vue APIs, composables, and components.
Run `npx nuxi prepare apps/web` to generate types if you see
import errors. Do NOT add manual imports for auto-imported items.

## Database Changes

1. Edit schema in `packages/db/schema/`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply
4. Update seed data in `packages/db/seed.ts`
5. Update relevant repository in `packages/db/repositories/`

## Adding a New Queue Consumer

- If the job completes in <15 minutes: add a Lambda handler in `services/worker/handlers/`
  and add `queue.subscribe("services/worker/handlers/myhandler.handler")` to sst.config.ts
- If the job needs >15 minutes: add it to the ECS worker service in `services/worker/handlers/index.ts`
  (the long-running consumer entrypoint)
- Write tests using the memory queue provider — never SQS in tests

## Adding Infrastructure

- All infra changes go in `sst.config.ts` — this is TypeScript, NOT CloudFormation
- Use SST components: `sst.aws.Queue`, `sst.aws.Bucket`, `sst.aws.Cron`, etc.
- Link resources to functions: `link: [db, queue, bucket]`
- Access in code via `import { Resource } from "sst"`
- Never hardcode ARNs, URLs, or connection strings
