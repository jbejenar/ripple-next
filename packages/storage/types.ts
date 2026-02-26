export interface StorageObject {
  key: string
  size: number
  lastModified: Date
  contentType?: string
}

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
}

export interface StorageProvider {
  upload(key: string, body: Buffer | Uint8Array | string, options?: UploadOptions): Promise<void>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  list(prefix?: string): Promise<StorageObject[]>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}
