# Testing Guide

## Test Pyramid

```mermaid
graph TB
    E2E["E2E Tests<br/>(Playwright)<br/>Slowest, fewest"]
    Component["Component Tests<br/>(Vue Test Utils)"]
    Handler["Lambda Handler Tests<br/>(Vitest + mock providers)"]
    Integration["Integration Tests<br/>(Vitest + Testcontainers)"]
    Unit["Unit Tests<br/>(Vitest)<br/>Fastest, most numerous"]

    E2E --- Component
    Component --- Handler
    Handler --- Integration
    Integration --- Unit

    style Unit fill:#e8f5e9
    style Integration fill:#c8e6c9
    style Handler fill:#fff3e0
    style Component fill:#ffe0b2
    style E2E fill:#ffcdd2
```

1. **Unit tests** (fastest, most numerous) — Vitest
2. **Integration tests** (real DB) — Vitest + Testcontainers
3. **Component tests** — Vue Test Utils
4. **Lambda handler tests** — Vitest + mock providers
5. **E2E tests** (slowest) — Playwright

## Running Tests

```bash
pnpm test          # All unit + integration tests
pnpm test:e2e      # Playwright E2E tests
pnpm test:ui       # Storybook component tests
```

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { createMockProviders } from '@ripple/testing'

describe('MyFeature', () => {
  it('does the thing', () => {
    const providers = createMockProviders()
    // test with providers.queue, providers.auth, etc.
  })
})
```

### Integration Tests (Real DB)

```typescript
import { setupTestDb, teardownTestDb } from '@ripple/testing'

describe('UserRepository', () => {
  let db: TestDb

  beforeAll(async () => {
    db = await setupTestDb() // Testcontainers Postgres
  })

  afterAll(() => teardownTestDb(db))

  it('creates a user', async () => {
    // test with real database
  })
})
```

### Component Tests

```typescript
import { mount } from '@vue/test-utils'
import RplButton from '../RplButton.vue'

describe('RplButton', () => {
  it('renders', () => {
    const wrapper = mount(RplButton, { slots: { default: 'Click' } })
    expect(wrapper.text()).toBe('Click')
  })
})
```

## Test Data

Use factories from `packages/testing/factories/`:

```typescript
import { userFactory, projectFactory } from '@ripple/testing'

const user = userFactory.build()
const users = userFactory.buildList(5)
```

## Mock Providers

All mock providers are available from `packages/testing/mocks/providers.ts`.
Tests use the [Provider Pattern](./provider-pattern.md) with in-memory implementations for speed.

```typescript
import { createMockProviders } from '@ripple/testing'

const { queue, auth, storage, email, events, cms } = createMockProviders()
```

## Related Documentation

- [Developer Guide](./developer-guide.md) — full setup and quality gate reference
- [Architecture](./architecture.md) — system overview
- [Provider Pattern](./provider-pattern.md) — how mock providers work
- [Data Model](./data-model.md) — schema reference for integration tests
- [ADR-003: Provider Pattern](./adr/003-provider-pattern.md) — why memory providers
