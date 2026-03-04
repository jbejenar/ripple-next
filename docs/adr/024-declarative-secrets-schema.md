# ADR-024: Declarative Secrets Schema

| Field        | Value                          |
| ------------ | ------------------------------ |
| **Status**   | Proposed                       |
| **Date**     | 2026-03-03                     |
| **Deciders** | Platform team                  |
| **Relates**  | ADR-003 (Provider pattern), ADR-004 (SST over CDK), ADR-012 (Env schema validation) |

## Context

Ripple Next uses `.env.example` as a flat file with comments to document
required environment variables. This approach has several shortcomings for an
AI-agent-first platform:

- Agents cannot programmatically determine which variables are required vs
  optional, which are secrets vs non-sensitive config, which stages they apply
  to, or which services consume them.
- No validation exists at boot time — a missing or malformed secret only
  surfaces as a runtime error, often deep in a call stack.
- Paired credentials (e.g. OAuth client ID + secret + token URL) have no
  structured representation — they are stored as separate, unrelated env vars.
- There is no concept of auto-generatable secrets (session keys, encryption
  keys) vs human-provided secrets (API keys, database URLs).

ADR-012 established env schema validation as a gate. This ADR extends that
concept to a full declarative schema covering secrets, their types, lifecycle,
and cross-service dependencies.

## Decision

Introduce a typed secrets schema in `packages/config/src/secrets.schema.ts`
using a `defineSecrets()` helper that produces a machine-readable registry of
all secrets in the platform.

Each entry in the schema declares:

| Property          | Type                            | Purpose                                    |
| ----------------- | ------------------------------- | ------------------------------------------ |
| `kind`            | `'api-key' \| 'connection-string' \| 'oauth-client' \| 'encryption-key' \| 'webhook-secret'` | Classification for tooling and audit |
| `description`     | `string`                        | Human and agent readable purpose           |
| `required`        | `boolean`                       | Whether the app can start without it       |
| `stages`          | `Stage[]`                       | Which deployment stages need this secret   |
| `format`          | `string`                        | Validation format (postgres-uri, url, etc) |
| `services`        | `string[]`                      | Which services/packages consume it         |
| `fields`          | `Record<string, FieldDef>`      | For structured/paired credentials          |
| `autoGenerate`    | `boolean`                       | Can the platform generate this at boot     |
| `rotatable`       | `boolean`                       | Whether this secret supports rotation      |
| `devDefault`      | `string \| Record`              | Safe default for local development         |
| `pipelineAccess`  | `boolean`                       | Whether CI/CD pipeline needs the value     |
| `direction`       | `'outbound' \| 'inbound'`       | We call them, or they call us              |
| `managedBy`       | `string`                        | If auto-provisioned by infra (e.g. 'aws-api-gateway') |

### Structured credentials

Secrets with `kind: 'oauth-client'` or any multi-value credential use the
`fields` property instead of a single value:

```typescript
MULESOFT_CLIENT: {
  kind: 'oauth-client',
  fields: {
    clientId: { format: 'string' },
    clientSecret: { format: 'string' },
    tokenUrl: { format: 'url', sensitive: false },
  },
}
```

At runtime, `secrets.getRequired('MULESOFT_CLIENT')` returns the full typed
object. In AWS, structured secrets are stored as JSON in Secrets Manager.

### Validation

Zod schemas are generated from the format declarations. At boot, the platform
validates every resolved secret against its format schema before the application
starts. Validation failures produce `RPL-SEC-002` (invalid format) errors.

### Provider implementation

Follows ADR-003. The `@ripple-next/secrets` package will provide:

- `MemorySecretsProvider` — tests and CI
- `EnvSecretsProvider` — local dev (.env file chain)
- `AWSSecretsProvider` — SSM Parameter Store + Secrets Manager
- `ChainSecretsProvider` — walks providers in priority order with caching

Resolution chain:

1. `process.env` (highest priority)
2. `.env.{stage}` files
3. SST linked secrets
4. AWS SSM Parameter Store
5. AWS Secrets Manager
6. Auto-generate (if schema allows)
7. Dev defaults (if schema provides)
8. Fail with `RPL-SEC-001`

## Consequences

### Positive

- Single source of truth for what the platform needs to run
- Agents can discover requirements via structured CLI output
- Boot-time validation catches misconfiguration before traffic arrives
- Structured credentials eliminate the "three separate env vars for one OAuth
  client" antipattern
- Auto-generatable secrets reduce human involvement in setup

### Negative

- Every new secret requires a schema entry — minor ceremony overhead
- Schema must be kept in sync with actual usage (mitigated by lint rule)

### Neutral

- Does not dictate where secrets are stored — that is the provider's concern
  (ADR-003)
