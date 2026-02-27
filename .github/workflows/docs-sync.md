---
on:
  push:
    branches: [main]
    paths:
      - 'packages/*/types.ts'
      - 'packages/db/schema/**'
      - 'sst.config.ts'
permissions:
  contents: read
  pull-requests: write
safe-outputs:
  create-pull-request:
    max: 1
---

# Keep Documentation Updated

When schemas, types, or infrastructure change, update the relevant documentation.

## Check and update:

- `docs/data-model.md` when `packages/db/schema/` changes
- `docs/api-contracts.md` when tRPC routers change
- `docs/architecture.md` when `sst.config.ts` changes
- `AGENTS.md` when new patterns are introduced

Run `pnpm typecheck` to verify types are consistent.
