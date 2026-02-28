# ADR-019: Fleet Governance Mechanism — Template Drift Detection and Sync Automation

**Status:** Accepted
**Date:** 2026-02-28
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

Ripple Next serves as the **golden-path source repository** for the Victorian
government digital platform. Downstream repositories clone or fork this repo to
build their own sites, inheriting CI pipelines, quality gates, toolchain pinning,
and infrastructure patterns.

Without a governance mechanism, downstream repos **drift** from the golden path
over time:

- Security patches to CI workflows don't propagate.
- Toolchain versions (Node.js, pnpm) fall behind, creating inconsistencies.
- Quality gate scripts become stale, reducing assurance.
- IaC policies diverge, weakening the security posture.
- Error taxonomy codes fall out of sync, breaking AI agent auto-triage across
  the fleet.

RN-024 (Fleet Update Mechanism + Template Drift Automation) is the **last
remaining top blocker** for ship-ready status. It requires:

1. Template repository from golden-path source
2. GitHub App or Action for template drift detection
3. Automated sync PRs for security/standards updates
4. Policy drift reporting dashboard

## Decision

Implement a **manifest-driven fleet governance mechanism** using GitHub Actions
(not a GitHub App) with the following architecture:

### 1. Fleet Policy Contract (`docs/fleet-policy.json`)

A machine-readable JSON manifest (schema: `ripple-fleet-policy/v1`) that defines:

- **Governed surfaces** — files and configurations that downstream repos must
  keep in sync with the golden path (8 surfaces across 3 severity levels)
- **Sync strategies** — per-surface: `sync` (exact copy), `merge` (safe update),
  or `advisory` (report only)
- **Local overrides** — paths that are explicitly NOT governed (domain-specific
  code: `apps/`, `services/`, provider implementations)
- **Exception workflow** — inline comment format for approved deviations, with
  90-day expiry

### 2. Severity Classification

| Severity | Action | Surfaces |
|----------|--------|----------|
| `security-critical` | PR opened immediately | Composite actions, toolchain pins, security config, IaC policies |
| `standards-required` | PR batched weekly | CI workflows, quality scripts, ESLint config, error taxonomy |
| `recommended` | Report only | Future advisory surfaces |

### 3. GitHub Action (Not App)

**Decision: GitHub Action first.** Rationale:

- Lower operational burden (no App hosting/maintenance)
- Faster to ship (runs in existing CI infrastructure)
- Sufficient for the current fleet size
- Can graduate to GitHub App later if org-scale API limits become a bottleneck

The Action runs as a scheduled workflow (weekly) with manual dispatch. Downstream
repos can also run the drift detection Action in their own CI.

### 4. Drift Detection Engine (`scripts/check-fleet-drift.mjs`)

Follows the established pattern of `check-readiness.mjs` and `iac-policy-scan.mjs`:

- Zero external dependencies (Node.js built-ins only)
- Reads `fleet-policy.json` for governed surfaces
- Compares target repo state against golden-path source
- Outputs structured `ripple-fleet-drift/v1` JSON
- Integrates with error taxonomy (`RPL-FLEET-*` codes)
- Exit code semantics: 0 = compliant, 1 = drift found

### 5. Sync PR Automation

When drift is detected:

- `sync` strategy surfaces → file patches applied, PR opened
- `merge` strategy surfaces → safe text merge, PR opened
- `advisory` strategy surfaces → included in compliance report only
- PR body includes drift findings, severity labels, and remediation steps from
  error taxonomy

### 6. Compliance Reporting

JSON artifact (`ripple-fleet-compliance/v1`) with per-repo compliance scores,
rendered as GitHub Actions step summary (markdown table). No web dashboard —
consistent with existing gate-summary and iac-report patterns.

Future low-priority items:
- Static HTML dashboard (post-RN-024)
- Full web dashboard (only if fleet grows to 10+ repos)

## Rationale

- **JSON over YAML** — All machine-readable contracts in this repo use JSON
  (readiness.json, error-taxonomy.json, iac-policies.json). fleet-policy.json
  follows the same convention.

- **Action over App** — A GitHub App requires hosting, webhook management, and
  App installation permissions. An Action runs in existing CI with no additional
  infrastructure. For a fleet of <10 repos, Actions are sufficient.

- **Manifest-driven** — The fleet policy manifest is the single source of truth
  for what is governed. Adding or removing governed surfaces is a JSON edit, not
  a code change. This is consistent with how `iac-policies.json` drives the IaC
  scanner.

- **Error taxonomy integration** — New `FLEET` category with 6 error codes
  enables AI agents to auto-triage fleet drift findings using the same lookup
  mechanism as all other failure modes.

- **Compliance as artifact** — Consistent with `gate-summary.json`,
  `iac-policy-report.json`, and `health-report.json` patterns. CI artifacts are
  the universal reporting layer; a web dashboard is not needed for MVP.

## Consequences

### Positive

- Downstream repos automatically receive security and standards updates via PRs.
- Fleet compliance is measurable and trackable over time.
- AI agents can detect and triage fleet drift using existing error taxonomy.
- Exception workflow prevents policy from being a blocker for legitimate deviations.
- Template distribution provides a clean starting point for new repos.

### Negative

- Fleet policy manifest requires maintenance as the golden path evolves.
- Sync PR automation requires downstream repos to grant write access.
- False positives in drift detection need tuning during pilot phase.

### Neutral

- New error taxonomy category (FLEET) adds 6 codes, bringing the total to 39.
- RN-024 is marked done when all four deliverables are verified.

## Related

- [Product Roadmap v5.0.0 — RN-024](../product-roadmap/README.md#rn-024-fleet-update-mechanism--template-drift-automation)
- [ADR-010: CI Observability](./010-ci-observability-supply-chain.md) — structured CI artifacts
- [ADR-018: AI-First Workflow Strategy](./018-ai-first-workflow-strategy.md) — error taxonomy, runbooks
- [Downstream Workflows Guide](../downstream-workflows.md) — composite action consumption
- [IaC Policy Scanner](../../scripts/iac-policy-scan.mjs) — analogous policy enforcement pattern
