---
applyTo: '**/*.test.ts,**/*.spec.ts'
---

# Testing Instructions

- Use Vitest for all unit and integration tests
- Use Playwright for E2E tests
- Use Vue Test Utils for component tests
- Always use mock/memory providers from `@ripple/testing`
- Use factories from `packages/testing/factories/` for test data
- Test file naming: `{source-name}.test.ts`
- Integration tests with real DB use Testcontainers (`@ripple/testing/helpers/db`)
- Never mock what you can test with a real (local) service
- Never use real AWS services in tests — always use memory providers
- Test structure: describe → it, with clear test names
- Assert behavior, not implementation details
- Coverage thresholds (never lower): Tier 1 (auth, db, queue) 60%/50% branches, Tier 2 (cms, email, storage, events, validation) 40%/30%, Tier 3 (ui, worker) 20%/10%
- New providers MUST pass conformance suite from `packages/testing/conformance/`
