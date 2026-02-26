import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { StorageProvider, StorageObject, UploadOptions } from '../types'

/**
 * Local filesystem storage provider for tests.
 * Zero cloud dependencies.
 */
export class FilesystemStorageProvider implements StorageProvider {
  private basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true })
    }
  }

  private resolve(key: string): string {
    return join(this.basePath, key)
  }

  async upload(key: string, body: Buffer | Uint8Array | string, _options?: UploadOptions): Promise<void> {
    const path = this.resolve(key)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, body)
  }

  async download(key: string): Promise<Buffer> {
    return readFileSync(this.resolve(key))
  }

  async delete(key: string): Promise<void> {
    const path = this.resolve(key)
    if (existsSync(path)) {
      unlinkSync(path)
    }
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(this.resolve(key))
  }

  async list(prefix?: string): Promise<StorageObject[]> {
    const dir = prefix ? this.resolve(prefix) : this.basePath
    if (!existsSync(dir)) return []

    return readdirSync(dir).map((name) => {
      const fullPath = join(dir, name)
      const stat = statSync(fullPath)
      return {
        key: prefix ? `${prefix}/${name}` : name,
        size: stat.size,
        lastModified: stat.mtime
      }
    })
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    return `file://${this.resolve(key)}`
  }
}
