import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner (MinIO reuses S3 provider)
const mockSend = vi.fn()
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'PutObject' })),
    GetObjectCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'GetObject' })),
    DeleteObjectCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'DeleteObject' })),
    HeadObjectCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'HeadObject' })),
    ListObjectsV2Command: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'ListObjectsV2' })),
  }
})

vi.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: vi.fn().mockResolvedValue('https://localhost:9000/signed'),
  }
})

import { MinioStorageProvider } from '../providers/minio'
import { S3Client } from '@aws-sdk/client-s3'

describe('MinioStorageProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an S3Client with local endpoint and forcePathStyle', () => {
    new MinioStorageProvider('my-bucket')

    expect(S3Client).toHaveBeenCalledWith({
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      forcePathStyle: true,
    })
  })

  it('accepts custom endpoint and region', () => {
    new MinioStorageProvider('my-bucket', 'http://minio:9000', 'eu-west-1')

    expect(S3Client).toHaveBeenCalledWith({
      region: 'eu-west-1',
      endpoint: 'http://minio:9000',
      forcePathStyle: true,
    })
  })

  describe('upload', () => {
    it('uploads data using S3-compatible API', async () => {
      mockSend.mockResolvedValue({})
      const provider = new MinioStorageProvider('my-bucket')

      await provider.upload('test/file.txt', Buffer.from('hello'))

      expect(mockSend).toHaveBeenCalledTimes(1)
      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Bucket: 'my-bucket',
        Key: 'test/file.txt',
      })
    })
  })

  describe('download', () => {
    it('downloads data using S3-compatible API', async () => {
      const mockBody = {
        transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([104, 105])),
      }
      mockSend.mockResolvedValue({ Body: mockBody })
      const provider = new MinioStorageProvider('my-bucket')

      const result = await provider.download('test/file.txt')

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result.toString()).toBe('hi')
    })
  })

  describe('delete', () => {
    it('deletes an object', async () => {
      mockSend.mockResolvedValue({})
      const provider = new MinioStorageProvider('my-bucket')

      await provider.delete('test/file.txt')

      expect(mockSend).toHaveBeenCalledTimes(1)
    })
  })

  describe('list', () => {
    it('lists objects in the bucket', async () => {
      const now = new Date()
      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'file1.txt', Size: 50, LastModified: now },
        ],
      })
      const provider = new MinioStorageProvider('my-bucket')

      const result = await provider.list()

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('file1.txt')
    })
  })
})
