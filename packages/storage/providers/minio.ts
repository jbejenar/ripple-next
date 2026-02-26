import { S3StorageProvider } from './s3'

/**
 * MinIO storage provider for local development.
 * MinIO is S3-compatible — reuses the S3 provider with local endpoint.
 */
export class MinioStorageProvider extends S3StorageProvider {
  constructor(
    bucket: string,
    endpoint: string = 'http://localhost:9000',
    region: string = 'us-east-1'
  ) {
    super(bucket, {
      endpoint,
      region,
      forcePathStyle: true
    })
  }
}
