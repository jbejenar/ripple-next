# Ripple Next — Proof of Life

A downstream consumer application built on `@ripple-next/*` packages, demonstrating that the platform's golden-path conventions work end-to-end.

## Purpose

This repo is the deliverable for [RN-054: Downstream Proof-of-Life](https://github.com/jbejenar/ripple-next/blob/main/docs/product-roadmap/README.md#rn-054-downstream-proof-of-life--first-consumer-deployment). It validates:

- Scaffold generator produces a working downstream repo
- `@ripple-next/*` packages (auth, db, ui) are consumable from the registry
- CI passes using golden-path reusable workflows
- Fleet drift detection runs against this repo
- The repo deploys to staging via SST

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev        # http://localhost:3000
pnpm verify     # run all quality gates
```

## Packages Consumed

| Package | Purpose |
|---------|---------|
| `@ripple-next/ui` | Ripple UI component library (47 components) |
| `@ripple-next/auth` | OIDC/OAuth authentication provider |
| `@ripple-next/db` | Drizzle ORM database layer |
| `@ripple-next/validation` | Zod validation schemas |
| `@ripple-next/shared` | Shared utilities and types |

## Architecture

See [docs/architecture.md](./docs/architecture.md) for the system overview.

## Deployment

```bash
npx sst deploy --stage staging
```

## License

Apache-2.0
