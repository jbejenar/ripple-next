# @ripple-next/testing

Shared testing infrastructure: mock providers, test factories, conformance suites, and integration test helpers.

## Install

```bash
pnpm add -D @ripple-next/testing
```

## Mock Providers

Create all 6 in-memory mock providers in one call:

```typescript
import { createMockProviders } from '@ripple-next/testing'

const mocks = createMockProviders()
// mocks.auth   — MockAuthProvider
// mocks.cms    — MockCmsProvider
// mocks.email  — MemoryEmailProvider
// mocks.events — MemoryEventBus
// mocks.queue  — MemoryQueueProvider
// mocks.storage — FilesystemStorageProvider
```

## Test Factories

Built on [Fishery](https://github.com/thoughtbot/fishery):

```typescript
import { userFactory, projectFactory } from '@ripple-next/testing'

const user = userFactory.build({ email: 'custom@example.com' })
const users = userFactory.buildList(5)
const project = projectFactory.build({ ownerId: user.id })
```

## Conformance Suites

Validate custom provider implementations against the contract:

```typescript
import {
  authConformance,
  queueConformance,
  emailConformance,
  storageConformance,
  eventBusConformance,
  cmsConformance,
} from '@ripple-next/testing/conformance'

// In your test file:
authConformance(MyOidcAuthProvider)
queueConformance(MyRedisQueueProvider)
```

## Integration Test Helpers

```typescript
import { setupTestDb, teardownTestDb } from '@ripple-next/testing'

let db: TestDb

beforeAll(async () => { db = await setupTestDb() })
afterAll(async () => { await teardownTestDb(db) })
```

Keycloak helper for OIDC integration tests:

```typescript
import { startKeycloak } from '@ripple-next/testing/helpers'

const keycloak = await startKeycloak() // Starts Keycloak Testcontainer
```
