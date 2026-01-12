import { type S3Client } from '@aws-sdk/client-s3'
import { describe, expect, it, vi } from 'vitest'

import {
  createS3StorageClient,
  InMemoryStorageClient,
  S3StorageClient
} from './StorageClient'

describe('InMemoryStorageClient', () => {
  describe('uploadJson', () => {
    it('should store data in memory', async () => {
      const client = new InMemoryStorageClient()

      await client.uploadJson('test.json', { foo: 'bar' })

      expect(client.get('test.json')).toEqual({ foo: 'bar' })
    })

    it('should store multiple files', async () => {
      const client = new InMemoryStorageClient()

      await client.uploadJson('file1.json', { a: 1 })
      await client.uploadJson('file2.json', { b: 2 })

      expect(client.get('file1.json')).toEqual({ a: 1 })
      expect(client.get('file2.json')).toEqual({ b: 2 })
    })

    it('should overwrite existing file', async () => {
      const client = new InMemoryStorageClient()

      await client.uploadJson('test.json', { version: 1 })
      await client.uploadJson('test.json', { version: 2 })

      expect(client.get('test.json')).toEqual({ version: 2 })
    })
  })

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      const client = new InMemoryStorageClient()

      expect(client.get('nonexistent.json')).toBeUndefined()
    })
  })

  describe('keys', () => {
    it('should return all stored keys', async () => {
      const client = new InMemoryStorageClient()

      await client.uploadJson('a.json', {})
      await client.uploadJson('b.json', {})
      await client.uploadJson('c.json', {})

      expect(client.keys().sort()).toEqual(['a.json', 'b.json', 'c.json'])
    })

    it('should return empty array when no files stored', () => {
      const client = new InMemoryStorageClient()

      expect(client.keys()).toEqual([])
    })
  })

  describe('clear', () => {
    it('should remove all stored data', async () => {
      const client = new InMemoryStorageClient()

      await client.uploadJson('a.json', {})
      await client.uploadJson('b.json', {})
      client.clear()

      expect(client.keys()).toEqual([])
      expect(client.get('a.json')).toBeUndefined()
    })
  })
})

describe('S3StorageClient', () => {
  const createMockS3Client = (): S3Client =>
    ({
      send: vi.fn()
    }) as unknown as S3Client

  describe('constructor', () => {
    it('should use provided S3 client', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockResolvedValue({})

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1' },
        mockS3
      )

      await client.uploadJson('test.json', {})

      expect(mockS3.send).toHaveBeenCalled()
    })

    it('should default publicRead to true', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockResolvedValue({})

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1' },
        mockS3
      )

      await client.uploadJson('test.json', {})

      const callArg = vi.mocked(mockS3.send).mock.calls[0][0] as unknown as {
        input: { ACL?: string }
      }
      expect(callArg.input.ACL).toBe('public-read')
    })

    it('should respect publicRead=false', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockResolvedValue({})

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1', publicRead: false },
        mockS3
      )

      await client.uploadJson('test.json', {})

      const callArg = vi.mocked(mockS3.send).mock.calls[0][0] as unknown as {
        input: { ACL?: string }
      }
      expect(callArg.input.ACL).toBeUndefined()
    })
  })

  describe('uploadJson', () => {
    it('should send PutObjectCommand with correct params', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockResolvedValue({})

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1' },
        mockS3
      )

      await client.uploadJson('data.json', { test: 'data' })

      expect(mockS3.send).toHaveBeenCalledTimes(1)
      const callArg = vi.mocked(mockS3.send).mock.calls[0][0] as unknown as {
        input: {
          Bucket: string
          Key: string
          Body: string
          ContentType: string
        }
      }
      expect(callArg.input.Bucket).toBe('test-bucket')
      expect(callArg.input.Key).toBe('data.json')
      expect(callArg.input.Body).toBe('{"test":"data"}')
      expect(callArg.input.ContentType).toBe('application/json')
    })

    it('should handle BigInt values in data', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockResolvedValue({})

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1' },
        mockS3
      )

      await client.uploadJson('data.json', { count: BigInt(12345) })

      const callArg = vi.mocked(mockS3.send).mock.calls[0][0] as unknown as {
        input: { Body: string }
      }
      // BigInt should be converted to number
      expect(JSON.parse(callArg.input.Body)).toEqual({ count: 12345 })
    })

    it('should throw on S3 error', async () => {
      const mockS3 = createMockS3Client()
      vi.mocked(mockS3.send).mockRejectedValue(new Error('S3 error'))

      const client = new S3StorageClient(
        { bucket: 'test-bucket', region: 'us-east-1' },
        mockS3
      )

      await expect(client.uploadJson('data.json', {})).rejects.toThrow(
        'Failed to upload data.json'
      )
    })
  })
})

describe('createS3StorageClient', () => {
  it('should create an S3StorageClient instance', () => {
    const mockS3 = { send: vi.fn() } as unknown as S3Client
    const client = createS3StorageClient(
      { bucket: 'test-bucket', region: 'us-east-1' },
      mockS3
    )

    expect(client).toBeInstanceOf(S3StorageClient)
  })
})
