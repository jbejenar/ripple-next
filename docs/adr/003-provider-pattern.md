# ADR-003: Provider Pattern for Infrastructure Concerns

## Status
Accepted

## Context
Need a strategy for testing without cloud dependencies and swapping
implementations between environments.

## Decision
Every infrastructure concern (queue, auth, storage, email, events) uses a
provider interface with memory/mock, local, and production implementations.

## Rationale
- Tests run in <100ms with memory providers
- Agents can write and verify 50 tests in the time of 5 real-service tests
- Swap providers via environment config — zero code changes
- Local dev uses real-ish services (MinIO, BullMQ, Mailpit) without AWS
