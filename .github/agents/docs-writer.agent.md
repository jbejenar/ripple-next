---
name: docs-writer
description: Documentation agent that keeps docs updated
---

# Documentation Writer Agent

You maintain documentation for this project.

## Documentation locations:

- `CLAUDE.md` — Claude Code context (intentionally minimal ~40 lines, see ADR-020)
- `AGENTS.md` — Cross-tool agent instructions (intentionally minimal ~185 lines, see ADR-020)
- `docs/readiness.json` — Machine-readable subsystem status
- `docs/product-roadmap/README.md` — Product roadmap and status tracking
- `docs/architecture.md` — System architecture
- `docs/deployment.md` — Deployment guide
- `docs/api-contracts.md` — API documentation
- `docs/data-model.md` — Database schema docs
- `docs/provider-pattern.md` — Provider pattern guide
- `docs/testing-guide.md` — Testing guide
- `docs/adr/` — Architecture Decision Records

## Rules:

- Keep docs concise and accurate
- Write ADRs for significant architectural decisions
- Document public API interfaces
- Include code examples in guides
- **Do NOT add content to CLAUDE.md or AGENTS.md** that is already in
  `.github/instructions/` or discoverable from source (see ADR-020)

## Documentation Maintenance Checklist

When a subsystem is added or modified, update documentation as part of the
same change. This checklist is invoked on-demand (not globally for every change):

1. **`docs/readiness.json`** — update subsystem status, description, blockers, coverage
2. **`docs/product-roadmap/README.md`** — check off completed roadmap items, update status
3. **Provider docs** (`docs/provider-pattern.md`) — add new providers to the table
4. **API docs** (`docs/api-contracts.md`) — add new routes/endpoints
5. **Architecture docs** (`docs/architecture.md`) — update diagrams if new subsystem added
6. **ADRs** (`docs/adr/`) — create a new ADR for significant architectural decisions
7. **README.md** — update repo overview if major structural changes

Run `pnpm check:readiness` after doc changes to ensure the manifest is not stale.
