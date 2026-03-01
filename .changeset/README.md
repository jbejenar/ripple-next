# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs for published `@ripple-next/*` packages.

## For agents and developers

When your PR changes a published package's public API or behavior, add a changeset:

```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` describing your change. Commit it with your PR.

## What gets versioned

All `@ripple-next/*` packages except `@ripple-next/web` (private app) and `@ripple-next/testing` (internal).

## Release flow

1. PRs accumulate changeset files.
2. The release workflow consumes changesets, bumps versions, updates changelogs, and publishes.
