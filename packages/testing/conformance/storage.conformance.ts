/**
 * Storage Provider Conformance Suite
 *
 * Every StorageProvider implementation must pass these tests.
 *
 * @example
 * ```ts
 * import { storageConformance } from '@ripple-next/testing/conformance/storage.conformance'
 * import { FilesystemStorageProvider } from '@ripple-next/storage'
 *
 * storageConformance({
 *   name: 'FilesystemStorageProvider',
 *   factory: () => new FilesystemStorageProvider('/tmp/test-storage'),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { StorageProvider } from '@ripple-next/storage'

interface StorageConformanceOptions {
  name: string
  factory: () => StorageProvider
  cleanup?: () => Promise<void>
}

export function storageConformance({ name, factory, cleanup }: StorageConformanceOptions): void {
  describe(`StorageProvider conformance: ${name}`, () => {
    let provider: StorageProvider

    beforeEach(() => {
      provider = factory()
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('upload() + download() round-trips content', async () => {
      const content = Buffer.from('hello conformance')
      await provider.upload('test/round-trip.txt', content)
      const downloaded = await provider.download('test/round-trip.txt')
      expect(downloaded.toString()).toBe('hello conformance')

      await provider.delete('test/round-trip.txt')
    })

    it('upload() with string body', async () => {
      await provider.upload('test/string-body.txt', 'string content')
      const downloaded = await provider.download('test/string-body.txt')
      expect(downloaded.toString()).toBe('string content')

      await provider.delete('test/string-body.txt')
    })

    it('exists() returns true for uploaded files', async () => {
      await provider.upload('test/exists-check.txt', 'data')
      const result = await provider.exists('test/exists-check.txt')
      expect(result).toBe(true)

      await provider.delete('test/exists-check.txt')
    })

    it('exists() returns false for missing files', async () => {
      const result = await provider.exists('test/does-not-exist-' + Date.now() + '.txt')
      expect(result).toBe(false)
    })

    it('delete() removes a file', async () => {
      await provider.upload('test/to-delete.txt', 'temporary')
      await provider.delete('test/to-delete.txt')
      const result = await provider.exists('test/to-delete.txt')
      expect(result).toBe(false)
    })

    it('list() returns uploaded files', async () => {
      await provider.upload('test/list-a.txt', 'a')
      await provider.upload('test/list-b.txt', 'b')

      const objects = await provider.list('test')
      const keys = objects.map((o) => o.key)

      expect(keys).toContain('test/list-a.txt')
      expect(keys).toContain('test/list-b.txt')

      for (const obj of objects) {
        expect(obj.size).toBeGreaterThan(0)
        expect(obj.lastModified).toBeInstanceOf(Date)
      }

      await provider.delete('test/list-a.txt')
      await provider.delete('test/list-b.txt')
    })

    it('list() returns empty array for non-existent prefix', async () => {
      const objects = await provider.list('nonexistent-prefix-' + Date.now())
      expect(objects).toEqual([])
    })

    it('getSignedUrl() returns a string URL', async () => {
      await provider.upload('test/signed-url.txt', 'data')
      const url = await provider.getSignedUrl('test/signed-url.txt')
      expect(typeof url).toBe('string')
      expect(url.length).toBeGreaterThan(0)

      await provider.delete('test/signed-url.txt')
    })
  })
}
