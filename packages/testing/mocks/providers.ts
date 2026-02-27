import { MemoryQueueProvider } from '@ripple/queue'
import { MockAuthProvider } from '@ripple/auth'
import { FilesystemStorageProvider } from '@ripple/storage'
import { MemoryEmailProvider } from '@ripple/email'
import { MemoryEventBus } from '@ripple/events'
import { MockCmsProvider } from '@ripple/cms'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface MockProviders {
  queue: MemoryQueueProvider
  auth: MockAuthProvider
  storage: FilesystemStorageProvider
  email: MemoryEmailProvider
  events: MemoryEventBus
  cms: MockCmsProvider
}

/**
 * Create all mock providers for testing.
 * Zero cloud dependencies, zero network calls.
 */
export function createMockProviders(): MockProviders {
  const tmpDir = mkdtempSync(join(tmpdir(), 'ripple-test-'))

  return {
    queue: new MemoryQueueProvider(),
    auth: new MockAuthProvider(),
    storage: new FilesystemStorageProvider(tmpDir),
    email: new MemoryEmailProvider(),
    events: new MemoryEventBus(),
    cms: new MockCmsProvider()
  }
}
