# ADR-004: SST v3 over CDK/CloudFormation

## Status

Accepted

## Context

Choosing an Infrastructure as Code tool for AWS deployments.

## Decision

Use SST v3 (Pulumi engine). Never use CDK or CloudFormation.

## Rationale

- SST v3 uses Pulumi, which deploys in parallel (~30-60s vs 5-10 min for CDK)
- Real AWS API error messages instead of cryptic CloudFormation errors
- No 500 resource limit per stack
- TypeScript-native — same language as the rest of the codebase
- High-level components (`sst.aws.Nuxt`) handle CloudFront + Lambda + S3 in one line
- `link` system passes connection strings and secrets automatically
- Per-PR staging environments with `--stage pr-123`
- `sst dev` for live local development with real AWS resources

## Related

- [Deployment Guide](../deployment.md) — deployment procedures using SST
- [Architecture](../architecture.md) — system overview
- [ADR-005: Lambda Default](./005-lambda-default-ecs-escape.md) — compute model
- [ADR-006: No Kubernetes](./006-no-kubernetes.md) — why not EKS
