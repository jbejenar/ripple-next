## Summary

<!-- 1-3 bullet points describing what this PR does and why -->

-

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor (no functional change)
- [ ] Infrastructure (SST, CI, deployment)
- [ ] Documentation

## Definition of Done

<!-- All items must be checked before merge. -->

### Required

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Changes have been tested locally

### If you changed...

- [ ] **A package interface** (`types.ts`): Updated all provider implementations
- [ ] **Database schema**: Migration generated (`pnpm db:generate`) and included
- [ ] **An API route/oRPC procedure**: Added or updated tests; ran `pnpm generate:openapi`
- [ ] **A UI component**: Added or updated component tests
- [ ] **A Lambda handler**: Added or updated handler tests with mock providers
- [ ] **Infrastructure** (`sst.config.ts`): Tested with preview deploy (`pr-*` stage)
- [ ] **Shared packages** (`@ripple-next/shared`, `@ripple-next/validation`): Checked downstream consumers

### For breaking changes

- [ ] Updated AGENTS.md if architectural patterns changed
- [ ] Updated relevant docs/ if contracts changed
- [ ] Documented migration steps for consumers

## Rollback plan

<!-- How would you revert this if something goes wrong in production? -->
<!-- For most changes: "Revert this PR" is sufficient. -->
<!-- For migrations or infra: describe the rollback steps. -->
