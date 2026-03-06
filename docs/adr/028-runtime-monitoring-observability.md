# ADR-028: Runtime Monitoring and Observability

**Date:** 2026-03-06
**Status:** Accepted
**Deciders:** Architecture team
**Context:** The platform has no runtime monitoring or alerting. Lambda-first architecture requires observability tooling that handles cold starts, short-lived invocations, and distributed traces without adding significant overhead.

## Context

Ripple Next is a Lambda-first platform deployed via SST v3 (ADR-004) with ECS Fargate
as an escape hatch for long-running workloads (ADR-005). The CI pipeline already has
structured observability for build-time artifacts (ADR-010), but there is no runtime
monitoring or alerting for deployed services.

Key architectural constraints that affect monitoring:

1. **Lambda cold starts and short-lived invocations** — Lambda functions start, execute,
   and terminate in milliseconds to seconds. Traditional APM agents that rely on
   long-running processes with persistent connections are a poor fit. Cold start overhead
   from monitoring agents directly impacts p99 latency.

2. **Nuxt SSR via Nitro** — The `sst.aws.Nuxt` component runs Nitro as a Lambda function.
   Server-side rendering latency is user-facing and must be observable without adding
   significant overhead to the critical rendering path.

3. **Provider pattern spans multiple backends** — The provider pattern (ADR-003) means
   the same application code may execute against Memory providers (test), BullMQ/Redis
   (local dev), or SQS/DynamoDB (production). Monitoring must not assume a specific
   backend and must work across all provider implementations.

4. **Distributed workloads** — The platform includes Lambda functions (Nuxt SSR, queue
   consumers, cron jobs, event handlers), ECS Fargate services (long worker, WebSocket),
   and managed data stores (RDS, Redis, DynamoDB). Traces must correlate requests across
   these boundaries.

5. **Existing error taxonomy** — The platform uses structured `RPL-*` error codes
   (docs/error-taxonomy.json) for machine-parseable diagnostics. Runtime monitoring
   must integrate with this taxonomy so alerts reference specific error codes.

6. **Government cost constraints** — The platform serves government digital services.
   Per-host or per-million-spans pricing models can escalate quickly at production scale.

## Options Evaluated

### Option 1: CloudWatch + X-Ray (AWS-native)

AWS-native observability. CloudWatch collects logs and metrics; X-Ray provides
distributed tracing. Lambda integration is built-in with zero additional infrastructure.

| Criterion | Assessment |
|-----------|------------|
| Cold-start overhead | Minimal — X-Ray daemon runs in the Lambda execution environment |
| Nuxt/Nitro compatibility | Works — Nitro runs as Lambda, CloudWatch captures stdout |
| Cost (dev/staging ~1K req/day) | ~$5/month (within free tier for most metrics) |
| Cost (prod small ~50K req/day) | ~$50-80/month (logs, metrics, X-Ray traces at 5% sampling) |
| Cost (prod large ~500K req/day) | ~$300-500/month (log ingestion dominates) |
| Agent-parseability | Moderate — CloudWatch Logs Insights supports JSON queries |
| SST v3 integration | Native — SST resources auto-configure CloudWatch |
| Error taxonomy integration | Manual — requires structured log format discipline |

**Strengths:** Zero vendor lock-in beyond AWS. No additional infrastructure. Free tier
covers development. Lambda metrics (duration, errors, throttles) are automatic.

**Weaknesses:** X-Ray trace UI is basic compared to commercial APM. No built-in anomaly
detection. CloudWatch dashboards require manual setup. Alarm configuration is verbose.

### Option 2: Datadog (full APM)

Commercial full-stack APM with Lambda layer, distributed tracing, log management,
infrastructure monitoring, and anomaly detection.

| Criterion | Assessment |
|-----------|------------|
| Cold-start overhead | 50-100ms added by Datadog Lambda layer |
| Nuxt/Nitro compatibility | Supported via dd-trace-js (requires manual instrumentation) |
| Cost (dev/staging ~1K req/day) | ~$70/month (Infrastructure + APM host pricing) |
| Cost (prod small ~50K req/day) | ~$400-600/month (APM + logs + infra) |
| Cost (prod large ~500K req/day) | ~$2,000-4,000/month (per-host + indexed spans + log volume) |
| Agent-parseability | Excellent — rich API, structured alerts, webhook integrations |
| SST v3 integration | Partial — Lambda layer via SST function props |
| Error taxonomy integration | Strong — custom tags map to RPL-* codes |

**Strengths:** Best-in-class dashboards, anomaly detection, and alerting. Excellent
developer experience. Strong Lambda support via the Datadog Forwarder.

**Weaknesses:** Expensive at scale. Adds cold-start latency. Vendor lock-in on
proprietary query language and data format. Government procurement may require
additional compliance review.

### Option 3: OpenTelemetry + Grafana Cloud (vendor-neutral)

OpenTelemetry (OTel) SDK for instrumentation with Grafana Cloud (or self-hosted
Grafana + Loki + Tempo + Mimir) as the backend. OTel Collector can run as a Lambda
layer or sidecar.

| Criterion | Assessment |
|-----------|------------|
| Cold-start overhead | 30-80ms for OTel Lambda layer (collector initialization) |
| Nuxt/Nitro compatibility | Good — OTel JS SDK instruments Node.js HTTP |
| Cost (dev/staging ~1K req/day) | ~$0-30/month (Grafana Cloud free tier covers small workloads) |
| Cost (prod small ~50K req/day) | ~$100-200/month (Grafana Cloud usage-based) |
| Cost (prod large ~500K req/day) | ~$500-1,200/month (traces and metrics volume-based) |
| Agent-parseability | Good — OTel semantic conventions are structured |
| SST v3 integration | Manual — requires Lambda layer configuration |
| Error taxonomy integration | Good — OTel attributes map to RPL-* codes |

**Strengths:** Vendor-neutral instrumentation. Can switch backends without re-instrumenting.
Growing ecosystem and CNCF backing. Self-hosted option eliminates vendor costs.

**Weaknesses:** Lambda support is maturing but not as polished as AWS-native or Datadog.
Collector adds complexity. Self-hosted Grafana stack is operationally expensive. OTel
SDK initialization adds cold-start latency.

### Option 4: Powertools for AWS Lambda + CloudWatch (Lambda-optimized)

AWS Powertools for Lambda (TypeScript) provides structured logging, custom metrics, and
tracing as lightweight middleware purpose-built for Lambda. Uses CloudWatch as the
backend but adds structured conventions on top.

| Criterion | Assessment |
|-----------|------------|
| Cold-start overhead | <5ms — lightweight library, no external daemon or layer required |
| Nuxt/Nitro compatibility | Good — works as Nitro middleware, structured JSON output |
| Cost (dev/staging ~1K req/day) | ~$5/month (CloudWatch pricing, within free tier) |
| Cost (prod small ~50K req/day) | ~$50-80/month (same as raw CloudWatch) |
| Cost (prod large ~500K req/day) | ~$300-500/month (same as raw CloudWatch) |
| Agent-parseability | Excellent — structured JSON logs with correlation IDs by default |
| SST v3 integration | Native — SST auto-configures CloudWatch; Powertools adds structure |
| Error taxonomy integration | Excellent — custom keys in structured logs map directly to RPL-* codes |

**Strengths:** Purpose-built for Lambda. Near-zero cold-start overhead. Structured JSON
logging out of the box. EMF (Embedded Metrics Format) publishes CloudWatch custom metrics
without API calls. Tracer wraps X-Ray with a simpler API. Open source (MIT). Maintained
by AWS with active community.

**Weaknesses:** AWS-only (no multi-cloud). Tracing is X-Ray under the hood (same UI
limitations). No built-in anomaly detection. Dashboard creation still manual.

## Decision

**Use AWS Powertools for Lambda (TypeScript) + CloudWatch as the default runtime
monitoring stack.** Provide OpenTelemetry as a documented escape hatch for deployments
that require vendor-neutral instrumentation or multi-cloud portability.

### Implementation approach

1. **Structured logging** — Use Powertools Logger as middleware in all Lambda handlers
   (Nuxt Nitro, queue consumers, cron jobs, event handlers). Every log entry includes:
   - `correlationId` (X-Ray trace ID)
   - `service` (e.g., `web`, `email-worker`, `cleanup-cron`)
   - `environment` (stage name from SST)
   - `errorCode` (RPL-* code when applicable)

2. **Custom metrics** — Use Powertools Metrics (EMF) to emit metrics without API calls:
   - `ColdStartDuration` — per function
   - `SSRRenderTime` — Nuxt page render latency
   - `QueueProcessingTime` — per queue consumer
   - `ErrorByCode` — counter per RPL-* error code

3. **Distributed tracing** — Use Powertools Tracer (X-Ray) for request correlation:
   - Auto-instrument AWS SDK calls (DynamoDB, SQS, S3)
   - Manual spans for database queries (Drizzle) and CMS API calls
   - Annotation with RPL-* error codes on failure spans

4. **Alerting** — CloudWatch Alarms with SNS notifications:
   - Lambda error rate > 1% sustained for 5 minutes
   - SSR p99 latency > 3 seconds
   - Cold start duration > 2 seconds (budget exceeded)
   - Queue dead-letter depth > 0
   - ECS task health check failures

5. **OpenTelemetry escape hatch** — Document how to replace Powertools Tracer with
   OTel SDK + OTel Lambda Layer for teams that need Grafana, Jaeger, or other backends.
   The structured logging and metrics layers remain Powertools regardless.

## Rationale

### Why Powertools over raw CloudWatch

Raw CloudWatch requires manual JSON formatting, custom metric API calls, and verbose
X-Ray SDK usage. Powertools provides the same CloudWatch backend with a developer-friendly
TypeScript API that enforces structured output by default. The cold-start overhead
difference is negligible (<5ms vs ~0ms) but the developer experience improvement is
significant.

### Why Powertools over Datadog

Datadog is the superior APM product, but the cost profile is incompatible with
government digital services at scale. At 500K requests/day, Datadog costs 4-8x more
than Powertools + CloudWatch. The Datadog Lambda layer also adds 50-100ms to cold
starts, which directly impacts SSR latency for the first request after a scale-up.

Datadog remains a viable upgrade path if the platform's observability needs outgrow
CloudWatch dashboards and alarms.

### Why Powertools over OpenTelemetry

OTel is the industry-standard instrumentation layer, but Lambda support is still
maturing. The OTel Lambda layer adds 30-80ms to cold starts compared to <5ms for
Powertools. Since the platform is AWS-only (ADR-004, ADR-005), the vendor-neutrality
benefit of OTel does not justify the cold-start tax.

OTel is the documented escape hatch because Powertools Logger and Metrics are
backend-agnostic (structured JSON + EMF). Only the Tracer component is X-Ray-specific,
making a partial migration to OTel straightforward.

### Why not a monitoring provider pattern

The provider pattern (ADR-003) is used for infrastructure concerns where test/local/prod
implementations genuinely differ (e.g., Memory queue vs BullMQ vs SQS). Monitoring
does not need a test implementation — tests do not emit metrics or traces. A simple
configuration toggle (enabled/disabled) is sufficient. If multi-cloud monitoring becomes
necessary, the OTel escape hatch provides the abstraction layer.

### Cost comparison summary

| Scale tier | CloudWatch + Powertools | Datadog | OTel + Grafana Cloud |
|------------|------------------------|---------|---------------------|
| Dev/staging (~1K req/day) | ~$5/mo | ~$70/mo | ~$0-30/mo |
| Prod small (~50K req/day) | ~$50-80/mo | ~$400-600/mo | ~$100-200/mo |
| Prod large (~500K req/day) | ~$300-500/mo | ~$2,000-4,000/mo | ~$500-1,200/mo |

## Consequences

### Positive

- Near-zero cold-start overhead (<5ms) preserves SSR latency budget
- Structured JSON logs enable agent auto-triage using existing RPL-* error codes
- No additional infrastructure or vendor contracts required
- CloudWatch Alarms integrate with existing AWS IAM and SNS setup
- Cost scales linearly with usage at AWS-native rates (no per-host pricing)
- Powertools is open source (MIT) — no vendor lock-in beyond AWS itself
- EMF metrics avoid CloudWatch PutMetricData API call costs and latency

### Negative

- CloudWatch dashboards and alarms require manual setup (no auto-generated APM views)
- X-Ray trace UI is less capable than Datadog or Grafana Tempo for complex trace analysis
- No built-in anomaly detection — alerting is threshold-based only
- AWS-only solution — would require re-instrumentation for multi-cloud deployment
- CloudWatch Logs Insights query language is less expressive than Datadog or Grafana LogQL

### Neutral

- CI observability (ADR-010) is unaffected — build-time and runtime monitoring are independent
- ECS Fargate services (long worker, WebSocket) use the same Powertools library but
  with persistent process configuration rather than per-invocation middleware
- The error taxonomy (docs/error-taxonomy.json) gains a new MONITOR category but
  existing RPL-* codes are unchanged

## RPL-MONITOR-* Error Codes

Five error codes are added to the error taxonomy for the monitoring subsystem:

| Code | Severity | Message |
|------|----------|---------|
| RPL-MONITOR-001 | error | Monitoring configuration missing or invalid |
| RPL-MONITOR-002 | error | Trace export failure — X-Ray or OTel collector unreachable |
| RPL-MONITOR-003 | warning | Metric emission failure — EMF payload rejected or CloudWatch unavailable |
| RPL-MONITOR-004 | warning | Alert threshold exceeded — CloudWatch Alarm entered ALARM state |
| RPL-MONITOR-005 | warning | Cold start duration exceeded budget (>2s) |

These codes are defined in `docs/error-taxonomy.json` under the `MONITOR` category.

## Related

- [ADR-003: Provider Pattern](./003-provider-pattern.md) — monitoring works across all provider implementations
- [ADR-004: SST over CDK](./004-sst-over-cdk.md) — SST auto-configures CloudWatch for Lambda
- [ADR-005: Lambda Default](./005-lambda-default-ecs-escape.md) — Lambda-first compute drives monitoring choice
- [ADR-010: CI Observability](./010-ci-observability-supply-chain.md) — build-time observability complements runtime monitoring
- [Architecture](../architecture.md) — system overview
- [Error Taxonomy](../error-taxonomy.json) — RPL-MONITOR-* codes
