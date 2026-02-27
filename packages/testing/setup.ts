// Global test setup
// This file is imported by vitest.workspace.ts for all packages

export { userFactory } from './factories/user.factory'
export { projectFactory } from './factories/project.factory'
export { setupTestDb, teardownTestDb, type TestDb } from './helpers/db'
export { createMockProviders, type MockProviders } from './mocks/providers'

// Conformance suites — run these in your provider tests
export {
  queueConformance,
  emailConformance,
  storageConformance,
  authConformance,
  eventBusConformance
} from './conformance'
