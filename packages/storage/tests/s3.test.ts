import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
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
    getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.example.com/test-key'),
  }
})

import { S3StorageProvider } from '../providers/s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

describe('S3StorageProvider', () => {
  let provider: S3StorageProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new S3StorageProvider('test-bucket')
  })

  describe('upload', () => {
    it('uploads a buffer', async () => {
      mockSend.mockResolvedValue({})

      await provider.upload('test-key', Buffer.from('hello'))

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Bucket: 'test-bucket',
        Key: 'test-key',
      })
    })

    it('passes content type and metadata options', async () => {
      mockSend.mockResolvedValue({})

      await provider.upload('image.png', Buffer.from('data'), {
        contentType: 'image/png',
        metadata: { originalName: 'photo.png' },
      })

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        ContentType: 'image/png',
        Metadata: { originalName: 'photo.png' },
      })
    })
  })

  describe('download', () => {
    it('downloads an object and returns a Buffer', async () => {
      const mockBody = {
        transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([72, 101, 108, 108, 111])),
      }
      mockSend.mockResolvedValue({ Body: mockBody })

      const result = await provider.download('test-key')

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result.toString()).toBe('Hello')
    })

    it('throws when body is empty', async () => {
      mockSend.mockResolvedValue({ Body: undefined })

      await expect(provider.download('empty-key')).rejects.toThrow(
        'S3 object body is empty for key: empty-key'
      )
    })
  })

  describe('delete', () => {
    it('deletes an object by key', async () => {
      mockSend.mockResolvedValue({})

      await provider.delete('test-key')

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Bucket: 'test-bucket',
        Key: 'test-key',
      })
    })
  })

  describe('exists', () => {
    it('returns true when object exists', async () => {
      mockSend.mockResolvedValue({})

      const result = await provider.exists('existing-key')

      expect(result).toBe(true)
    })

    it('returns false when HeadObject throws', async () => {
      mockSend.mockRejectedValue(new Error('NotFound'))

      const result = await provider.exists('missing-key')

      expect(result).toBe(false)
    })
  })

  describe('list', () => {
    it('lists objects with prefix', async () => {
      const now = new Date()
      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'uploads/file1.txt', Size: 100, LastModified: now },
          { Key: 'uploads/file2.txt', Size: 200, LastModified: now },
        ],
      })

      const result = await provider.list('uploads/')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ key: 'uploads/file1.txt', size: 100, lastModified: now })
      expect(result[1]).toEqual({ key: 'uploads/file2.txt', size: 200, lastModified: now })
    })

    it('returns empty array when no contents', async () => {
      mockSend.mockResolvedValue({ Contents: undefined })

      const result = await provider.list()

      expect(result).toHaveLength(0)
    })

    it('filters out objects missing required fields', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'valid.txt', Size: 100, LastModified: new Date() },
          { Key: undefined, Size: 100, LastModified: new Date() },
          { Key: 'no-size.txt', Size: undefined, LastModified: new Date() },
        ],
      })

      const result = await provider.list()

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('valid.txt')
    })
  })

  describe('getSignedUrl', () => {
    it('returns a presigned URL', async () => {
      const result = await provider.getSignedUrl('test-key')

      expect(result).toBe('https://signed-url.example.com/test-key')
      expect(getSignedUrl).toHaveBeenCalled()
    })

    it('passes custom expiration', async () => {
      await provider.getSignedUrl('test-key', 7200)

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 }
      )
    })

    it('defaults to 3600s expiration', async () => {
      await provider.getSignedUrl('test-key')

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 }
      )
    })
  })

  describe('error handling', () => {
    it('propagates upload errors', async () => {
      mockSend.mockRejectedValue(new Error('S3 upload failed'))

      await expect(provider.upload('key', Buffer.from('data'))).rejects.toThrow('S3 upload failed')
    })

    it('propagates download errors', async () => {
      mockSend.mockRejectedValue(new Error('S3 access denied'))

      await expect(provider.download('key')).rejects.toThrow('S3 access denied')
    })
  })
})
