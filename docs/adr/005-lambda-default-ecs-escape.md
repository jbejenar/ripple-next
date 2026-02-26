# ADR-005: Lambda by Default, ECS Fargate as Escape Hatch

## Status
Accepted

## Context
Choosing the default compute model for the application.

## Decision
Lambda is the default compute. ECS Fargate is used only when Lambda's
constraints require it (>15 min timeout, persistent connections, batch).

## Rationale
- Zero infra config for the 90% case
- SST handles CloudFront + Lambda + S3 automatically
- Queue consumption is one line: `queue.subscribe(handler)`
- Instant logs — agents can read Lambda output in CI
- No Dockerfile, health checks, ALB, or scaling policies needed for most workloads
- ECS Fargate provides a clean escape hatch with SST Cluster when needed
