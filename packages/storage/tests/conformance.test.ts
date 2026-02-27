import { storageConformance } from '@ripple/testing/conformance/storage.conformance'
import { FilesystemStorageProvider } from '../providers/filesystem'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

storageConformance({
  name: 'FilesystemStorageProvider',
  factory: () => {
    const dir = mkdtempSync(join(tmpdir(), 'ripple-storage-conformance-'))
    return new FilesystemStorageProvider(dir)
  }
})
