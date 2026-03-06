import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageProvider, StorageObject, UploadOptions } from '../types'

/**
 * AWS S3 storage provider for production.
 * Also works with MinIO (S3-compatible) in local dev.
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client
  private bucket: string

  constructor(
    bucket: string,
    options?: { endpoint?: string; region?: string; forcePathStyle?: boolean }
  ) {
    this.bucket = bucket
    this.client = new S3Client({
      region: options?.region ?? 'ap-southeast-2',
      endpoint: options?.endpoint,
      forcePathStyle: options?.forcePathStyle ?? false
    })
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array | string,
    options?: UploadOptions
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: options?.contentType,
        Metadata: options?.metadata
      })
    )
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
    if (!result.Body) {
      throw new Error(`S3 object body is empty for key: ${key}`)
    }
    const bytes = await result.Body.transformToByteArray()
    return Buffer.from(bytes)
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }))
      return true
    } catch {
      return false
    }
  }

  async list(prefix?: string): Promise<StorageObject[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix })
    )
    return (result.Contents ?? [])
      .filter((obj) => obj.Key && obj.Size !== undefined && obj.LastModified)
      .map((obj) => ({
        key: obj.Key as string,
        size: obj.Size as number,
        lastModified: obj.LastModified as Date
      }))
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresIn ?? 3600
    })
  }
}
