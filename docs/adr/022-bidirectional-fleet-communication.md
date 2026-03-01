# ADR-022: Bidirectional Fleet Communication — Downstream Feedback, AI Instruction Governance, Version Tracking

**Status:** Accepted
**Date:** 2026-03-01
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

ADR-019 established a **manifest-driven fleet governance mechanism** for
upstream→downstream communication: 9 governed surfaces, drift detection, sync
PRs, and compliance reporting. This solved the critical problem of downstream
repos silently drifting from the golden path.

However, governance is **one-directional** — there is no mechanism for
downstream repos to communicate back to the golden-path source:

- **No feedback loop** — downstream teams discover bugs, improvements, or
  policy friction but have no structured way to report back. Insights are lost
  in Slack threads or ad-hoc issues with no standard format.
- **No AI instruction sync** — the 15 AI instruction files (`CLAUDE.md`,
  `AGENTS.md`, `.github/instructions/*`, `.github/agents/*`,
  `.github/prompts/*`) are scaffolded once but never synced. Stale instructions
  degrade agent performance across the fleet over time.
- **No version awareness** — downstream repos have no way to know how far
  behind the golden path they are or what changed since they last synced.

Industry comparison:

- **Backstage** has no reverse sync mechanism (open problem #14416).
- **Cruft / Copier** are one-directional template updaters with no feedback
  channel.
- No existing platform provides AI-assisted reverse sync from downstream to
  upstream.

## Decision

### 1. Fleet Feedback System (downstream→upstream)

Introduce a structured feedback mechanism for downstream repos to communicate
back to the golden-path source via GitHub Issues:

- **5 feedback types:** `feature-request`, `bug-report`, `policy-exception`,
  `improvement-share`, `pain-point`
- **Transport:** GitHub Issues via `gh` CLI — not `repository_dispatch`.
  Lower permission requirements: `issues: write` vs `repo` scope.
- **Structured payload:** JSON payload in issue body between
  `<!-- fleet-feedback-begin -->` and `<!-- fleet-feedback-end -->` markers.
  Schema: `ripple-fleet-feedback/v1` (see `docs/fleet-feedback-schema.json`).
- **Intake workflow:** GitHub Actions workflow in upstream repo auto-triages
  incoming feedback: validate schema, apply labels, deduplicate by
  content hash, compute priority score.
- **Reverse sync for `improvement-share`:** when a downstream repo submits an
  improvement with a diff, the intake workflow auto-creates a draft PR if the
  diff applies cleanly — enabling true reverse sync.

### 2. Governed Surface Expansion (upstream→downstream)

Expand the fleet policy with two new governed surfaces:

| ID | Name | Strategy | Severity |
|----|------|----------|----------|
| `FLEET-SURF-010` | AI Agent Instructions | `advisory` | `recommended` |
| `FLEET-SURF-011` | Fleet Governance Tooling | `sync` | `standards-required` |

- **FLEET-SURF-010** covers `CLAUDE.md`, `AGENTS.md`,
  `.github/copilot-instructions.md`, `.github/instructions/*`,
  `.github/agents/*`, `.github/prompts/*`. Advisory strategy because
  downstream repos legitimately customise their AI instructions —
  auto-overwrite would destroy domain-specific guidance.
- **FLEET-SURF-011** covers fleet governance scripts and policy files:
  `scripts/check-fleet-drift.mjs`, `docs/fleet-policy.json`,
  `.github/actions/fleet-drift/action.yml`. Sync strategy ensures all repos
  run the same drift detection logic.

### 3. Golden-Path Version Tracking (`.fleet.json`)

Introduce a `.fleet.json` file in downstream repos, inspired by Copier's
`.copier-answers.yml`:

```json
{
  "schema": "ripple-fleet-version/v1",
  "goldenPathRepo": "org/ripple-next",
  "goldenPathVersion": "<commit SHA>",
  "scaffoldedAt": "2026-01-15T10:30:00Z",
  "lastSyncedAt": "2026-02-28T14:00:00Z",
  "fleetPolicyVersion": "1.2.0"
}
```

This enables "you're N commits behind" awareness in drift reports and provides
context for feedback submissions.

### 4. Fleet Changelog (`docs/fleet-changelog.json`)

Machine-readable change history for AI agent consumption. Schema:
`ripple-fleet-changelog/v1`. Each entry includes version, date, summary,
typed changes, and upgrade actions. AI agents in downstream repos can read
the changelog to understand what changed and advise on upgrade priority.

### 5. Proactive Update Notifications

On golden-path releases, the upstream repo sends a `repository_dispatch` event
to registered downstream repos. The downstream workflow processes the
notification and creates an awareness issue with:

- What changed (from fleet changelog)
- Current compliance impact
- Recommended upgrade actions

## Rationale

- **GitHub Issues over `repository_dispatch`** for feedback — Issues provide
  native visibility, search, threading, and labelling. `repository_dispatch`
  requires `repo` scope (overly broad) and events are fire-and-forget with no
  built-in threading. Issues require only `issues: write`.

- **Advisory strategy for AI instructions** — downstream repos customise their
  AI instructions for domain-specific guidance. Sync or merge strategies would
  overwrite these customisations. Advisory reports staleness without forcing
  updates.

- **JSON contracts** — consistent with `fleet-policy.json`,
  `error-taxonomy.json`, `iac-policies.json`, and all other machine-readable
  contracts in the repo.

- **Zero external dependencies** — consistent with all existing fleet scripts
  (`check-fleet-drift.mjs`, `iac-policy-scan.mjs`, `check-readiness.mjs`).
  Feedback submission uses `gh` CLI which is pre-installed on GitHub Actions
  runners.

- **Schema versioning** — `ripple-fleet-feedback/v1` and
  `ripple-fleet-changelog/v1` follow the established pattern of
  `ripple-fleet-drift/v1`, `ripple-fleet-policy/v1`, and
  `ripple-fleet-compliance/v1`.

## Consequences

### Positive

- Closed governance loop — downstream feedback reaches upstream in a structured,
  actionable format.
- AI agents can autonomously share improvements discovered during downstream
  work, enabling fleet-wide learning.
- Stale AI instruction detection prevents degraded agent performance across the
  fleet.
- Version tracking gives downstream repos clear visibility into golden-path
  evolution.
- Fleet changelog provides AI-readable change history for upgrade reasoning.

### Negative

- `FLEET_FEEDBACK_TOKEN` secret required in downstream repos — a fine-grained
  PAT with `issues: write` on the upstream repo.
- Intake processing overhead — the upstream workflow must validate, deduplicate,
  and triage incoming feedback issues.

### Neutral

- +4 error taxonomy codes (FEEDBACK category), bringing the taxonomy total to
  59 codes across 16 categories.
- +2 governed surfaces (11 total), expanding fleet-policy.json.
- 3 new schema versions: `ripple-fleet-feedback/v1`,
  `ripple-fleet-changelog/v1`, `ripple-fleet-version/v1`.

## Related

- [ADR-019: Fleet Governance](./019-fleet-governance.md) — upstream→downstream governance
- [ADR-018: AI-First Workflow Strategy](./018-ai-first-workflow-strategy.md) — error taxonomy, AI agents
- [ADR-020: Context File Minimalism](./020-context-file-minimalism.md) — AI instruction file guidelines
- [Product Roadmap — RN-024](../product-roadmap/ARCHIVE.md#rn-024-fleet-update-mechanism--template-drift-automation) — fleet update mechanism
- [RN-052: Bidirectional Fleet Communication](../product-roadmap/) — this initiative
