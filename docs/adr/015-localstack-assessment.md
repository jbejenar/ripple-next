# ADR-015: LocalStack Assessment — Provider Pattern over Emulation

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Architecture team

## Context

The team evaluated [LocalStack](https://localstack.cloud/) as an option for local
AWS service emulation during development and testing. LocalStack provides emulated
SQS, S3, DynamoDB, EventBridge, and other AWS services in a single Docker container.

This assessment arose during roadmap planning when considering how to close the gap
between local development and production AWS services.

## Decision

**LocalStack is NOT the default local-dev path for this repository.** It may be used
as an optional, narrow AWS API-shape compatibility check only.

### Rationale

This repo uses a **provider pattern** ([ADR-003](./003-provider-pattern.md)) with
local-first implementations that are faster, simpler, and less flaky for agent loops:

| Concern | Test Provider | Local Dev Provider | Production Provider |
|---------|--------------|-------------------|-------------------|
| Queue | MemoryQueueProvider | BullMQQueueProvider | SqsQueueProvider |
| Storage | FilesystemStorageProvider | MinioStorageProvider | S3StorageProvider |
| Email | MemoryEmailProvider | SmtpEmailProvider (Mailpit) | SesEmailProvider |
| Events | MemoryEventBus | MemoryEventBus | EventBridgeBus |
| CMS | MockCmsProvider | MockCmsProvider | DrupalCmsProvider |

**Why provider pattern beats LocalStack for this project:**

1. **Speed** — Memory providers run in <1ms per operation. LocalStack adds container
   startup (~5–15s) and network overhead on every API call.
2. **Reliability** — LocalStack's emulation occasionally drifts from real AWS behavior
   (especially for IAM policies, EventBridge filtering, and SQS FIFO semantics). Provider
   conformance tests against the real interface are more trustworthy.
3. **Agent-friendliness** — AI agents iterate 10x faster with mock providers. 50 test
   cycles in the time it takes to run 5 with cloud or emulated services.
4. **Simplicity** — No additional orchestration (docker-compose overlay, pro license for
   advanced services, version pinning for LocalStack itself).
5. **Targeted fidelity** — When AWS-specific behavior matters (IAM policies, SQS
   visibility timeout, S3 lifecycle rules), the preview deploy system (`npx sst deploy
   --stage pr-N`) provides real AWS validation per PR.

### Recommended Compromise

- Keep LocalStack **optional**, not required.
- Use it only for narrow AWS API-shape compatibility testing (e.g., SQS/S3 IAM policy
  behavior before preview deploy).
- Gate behind `pnpm test:aws-compat` so routine agent workflows remain low-friction.
- **Do not** add LocalStack to `docker-compose.yml` or the devcontainer.

## Consequences

### Positive

- Developer and agent workflows remain fast (sub-100ms test loops).
- No additional Docker container overhead in local dev.
- Provider conformance suites provide stronger guarantees than emulation.
- Preview deploys validate real AWS behavior when needed.

### Negative

- Developers cannot test AWS-specific behaviors (IAM, lifecycle rules) locally without
  preview deploy or optional LocalStack setup.
- Some AWS SDK edge cases may only surface in preview/staging environments.

### Neutral

- If a future service requires AWS-specific local testing that cannot be abstracted by
  the provider pattern, LocalStack can be introduced as an opt-in tool at that point.

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — core pattern that makes
  LocalStack unnecessary for most workflows
- [ADR-004: SST v3](./004-sst-over-cdk.md) — preview deploys as the real-AWS validation path
- [RN-024](../product-roadmap/README.md#rn-024-fleet-update-mechanism--template-drift-automation) — fleet template strategy (where LocalStack policy might apply org-wide)
