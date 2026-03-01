import { MemoryQueueProvider } from '@ripple-next/queue'
import { MockAuthProvider } from '@ripple-next/auth'
import { FilesystemStorageProvider } from '@ripple-next/storage'
import { MemoryEmailProvider } from '@ripple-next/email'
import { MemoryEventBus } from '@ripple-next/events'
import { MockCmsProvider } from '@ripple-next/cms'
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
