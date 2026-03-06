# ADR-026: GitHub OIDC Federation — Zero Secrets in CI/CD

| Field        | Value                          |
| ------------ | ------------------------------ |
| **Status**   | Accepted                       |
| **Date**     | 2026-03-03                     |
| **Deciders** | Platform team                  |
| **Relates**  | ADR-004 (SST over CDK), ADR-024 (Secrets schema) |

## Context

Ripple Next's CI/CD pipeline currently uses GitHub Secrets to store AWS
credentials (access key ID + secret access key) and other sensitive values.
These are injected into GitHub Actions workflows as environment variables during
deploy jobs.

This approach creates several problems:

1. **Secrets sprawl** — the same secret exists in both GitHub and AWS, with no
   programmatic way to verify they match or detect drift.
2. **Long-lived credentials** — AWS access keys do not expire unless manually
   rotated, violating least-privilege and time-limited access principles.
3. **Repository duplication** — downstream fleet repos (ADR-019) each need their
   own copy of shared secrets, multiplying the rotation surface.
4. **Agent opacity** — AI agents cannot read or audit GitHub Secrets without
   elevated PAT permissions, making the pipeline a black box for automated
   workflows.
5. **No audit trail** — GitHub Secrets are write-only. There is no log of when a
   secret was last read, by which workflow, or whether it has been rotated.

GitHub Actions supports OpenID Connect (OIDC) identity tokens, which allow
workflows to authenticate to cloud providers without storing cloud credentials.
AWS IAM supports OIDC federation natively.

Note: The existing `deploy-staging.yml` and `deploy-production.yml` workflows
already use `aws-actions/configure-aws-credentials@v4` with OIDC role
assumption. This ADR formalises that pattern and introduces the IAM
infrastructure-as-code component to make the OIDC setup reproducible.

## Decision

Replace all AWS credential storage in GitHub Secrets with OIDC federation.
Codify the IAM trust policy and deploy role as an SST infrastructure component
in `infra/github-oidc.ts`.

### Architecture

```
GitHub Actions workflow starts
  -> GitHub mints an OIDC token proving:
      "I am repo jbejenar/ripple-next, branch main, environment production"
  -> Workflow calls aws-actions/configure-aws-credentials with role-to-assume
  -> AWS STS validates the OIDC token against the trust policy
  -> AWS returns temporary session credentials (1 hour TTL)
  -> Pipeline uses temporary credentials to run sst deploy
  -> Deployed app reads secrets from AWS at runtime via IAM execution role
```

### IAM Trust Policy

The trust policy is scoped tightly to prevent unauthorised assumption:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": [
          "repo:jbejenar/ripple-next:ref:refs/heads/main",
          "repo:jbejenar/ripple-next:environment:production",
          "repo:jbejenar/ripple-next:environment:staging"
        ]
      }
    }
  }]
}
```

### What Is Stored in GitHub

After migration, the only values in GitHub are non-sensitive configuration:

| Variable               | Value                                   | Sensitive |
| ---------------------- | --------------------------------------- | --------- |
| `AWS_DEPLOY_ROLE_ARN`  | `arn:aws:iam::123456789:role/...`       | No        |
| `AWS_REGION`           | `ap-southeast-2`                        | No        |

These can be stored as GitHub Variables (not Secrets) or hardcoded in the
workflow file. Neither requires protection.

### What Lives in AWS

AWS is the single source of truth for all secrets:

| Store                  | Contents                                | Accessed by       |
| ---------------------- | --------------------------------------- | ----------------- |
| SSM Parameter Store    | Non-sensitive config, feature flags     | Pipeline + Runtime|
| AWS Secrets Manager    | API keys, OAuth creds, DB passwords     | Runtime only      |

The pipeline reads secrets only when necessary (e.g. `DATABASE_URL` for
migrations). The `pipelineAccess` field in the secrets schema (ADR-024)
controls which secrets the deploy role can access.

### IaC Implementation

The OIDC provider and deploy role are managed as an SST-compatible Pulumi
component in `infra/github-oidc.ts`, ensuring they are version-controlled and
reproducible. This component is run once per AWS account to bootstrap the
trust relationship.

### Downstream Fleet Impact

Downstream repos (ADR-019) share the same OIDC provider but receive
individually scoped IAM roles. The fleet governance tooling generates
trust policies scoped to each downstream repo's GitHub path.

## Consequences

### Positive

- Zero long-lived credentials anywhere in the CI/CD chain
- AWS is the single source of truth — no synchronisation required
- Temporary credentials (1hr TTL) limit blast radius of any compromise
- Full CloudTrail audit trail for every secret access
- AI agents can manage secrets entirely through the platform CLI
- Downstream repos inherit the pattern without storing their own credentials

### Negative

- Initial setup requires IAM changes — needs AWS admin access once
- OIDC debugging can be opaque when trust policy conditions don't match
  (mitigated by runbook with common errors)

### Neutral

- Does not change the runtime secrets resolution chain — apps still read from
  SSM/Secrets Manager via IAM execution roles as before
- Compatible with future multi-account setups (separate trust policies per
  account)
