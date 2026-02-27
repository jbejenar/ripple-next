# ADR-014: Preview Deploy Environment Guardrails

**Date:** 2026-02-27
**Status:** Accepted
**Deciders:** Architecture team
**Context:** Preview deploys depend on a repository-level secret (`AWS_ROLE_ARN`) with no explicit environment-level guardrails per stage. The AI Principal Engineer review flagged this as blocker #4, noting that "preview deploy depends on long-lived repo secret naming convention, lacking explicit environment-level guardrails per stage."

## Context

The current preview deploy workflow (`deploy-preview.yml`) has several
characteristics that need tightening:

1. **No environment protection** — Preview deploys use `secrets.AWS_ROLE_ARN`
   directly without GitHub environment protection rules. Any PR can trigger a
   deploy if the secret exists.
2. **No resource limits** — Preview stages can create unbounded AWS resources
   without cost or resource caps.
3. **No label gating** — Every PR with code changes triggers a deploy attempt,
   even for docs-only or config-only changes.
4. **Cleanup reliability** — The cleanup workflow runs on PR close, but there's
   no fallback for orphaned resources.

## Decision

### 1. GitHub Environment for preview deploys

Create a `preview` GitHub environment with:

- **No required reviewers** — preview deploys should be automated for fast feedback
- **Deployment branch pattern** — only branches matching `*` (all branches, since
  any PR branch should be deployable)
- **Environment secrets** — Move `AWS_ROLE_ARN` to the `preview` environment to
  scope credentials per deployment tier

### 2. Label-gated deploys

Preview deploys only trigger when:
- The PR has a `deploy-preview` label, OR
- The PR modifies infrastructure files (`sst.config.ts`, `.github/workflows/deploy-*`)

This prevents unnecessary deploys for docs-only or test-only changes and reduces
AWS costs.

### 3. Resource tagging and cost tracking

All preview resources are tagged with:
- `stage: pr-{number}`
- `owner: github-actions`
- `ttl: 7d` (time-to-live for cost management)

SST v3 handles resource tagging via the stage config in `sst.config.ts`.

### 4. Orphaned resource cleanup

A scheduled workflow (`cleanup-orphaned-previews.yml`) runs weekly to:
- List all `pr-*` stages in AWS
- Compare against open PRs
- Tear down any stages whose PR is already closed/merged
- Report findings as a workflow summary

### 5. Deploy status reporting

Preview deploy status is reported back to the PR as a deployment status
(GitHub Deployments API), not just a comment. This enables:
- Deployment status checks in branch protection
- Deployment history in the PR timeline
- Environment URL linkage in the GitHub UI

## Consequences

**Positive:**
- Preview deploys are scoped to a GitHub environment with explicit secrets
- Label gating reduces unnecessary AWS resource creation
- Orphaned resource cleanup prevents cost drift
- Deployment status API provides better GitHub integration
- Infrastructure changes are still auto-deployed (no label needed)

**Negative:**
- Adds a manual step (labeling) for PRs that need preview deploys
- Weekly cleanup may leave orphaned resources for up to 7 days
- Requires GitHub environment setup (one-time admin action)

**Trade-off:**
The label-gating approach was chosen over always-deploy because most PRs don't
need a preview environment. For the minority that do (infra changes, E2E
validation), the label is a low-friction signal. Infrastructure changes bypass
the label requirement entirely.
