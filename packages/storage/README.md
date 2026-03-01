# @ripple-next/storage

Cloud-agnostic file storage provider abstraction with presigned URL support.

## Install

```bash
pnpm add @ripple-next/storage
```

## Providers

| Provider | Use case | Backend |
|----------|----------|---------|
| `FilesystemStorageProvider` | Tests | Local filesystem |
| `MinioStorageProvider` | Local dev | S3-compatible MinIO |
| `S3StorageProvider` | Production | AWS S3 |

## Interface

```typescript
interface StorageProvider {
  upload(key: string, body: Buffer | Uint8Array | string, options?: UploadOptions): Promise<void>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  list(prefix?: string): Promise<StorageObject[]>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}
```

## Usage

```typescript
import { S3StorageProvider, FilesystemStorageProvider } from '@ripple-next/storage'

// Production
const storage = new S3StorageProvider({ bucket: 'my-bucket', region: 'ap-southeast-2' })

// Tests
const storage = new FilesystemStorageProvider({ basePath: '/tmp/test-storage' })

await storage.upload('reports/2026/q1.pdf', pdfBuffer, { contentType: 'application/pdf' })
const url = await storage.getSignedUrl('reports/2026/q1.pdf', 3600) // 1 hour
```

## Conformance Testing

```typescript
import { storageConformance } from '@ripple-next/testing/conformance'

storageConformance(MyCustomStorageProvider)
```

## Related

- [Provider pattern](../../docs/provider-pattern.md)
