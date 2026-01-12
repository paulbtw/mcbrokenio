import {
  ObjectCannedACL,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { Logger } from '@sailplane/logger'

const logger = new Logger('StorageClient')

/**
 * Interface for storage operations
 * Abstracts away the specific storage implementation (S3, local, etc.)
 */
export interface StorageClient {
  /**
   * Upload JSON data to storage
   * @param key - The object key (file name)
   * @param data - The data to upload
   * @returns Promise that resolves when upload is complete
   */
  uploadJson(key: string, data: unknown): Promise<void>
}

/**
 * Configuration for S3 storage client
 */
export interface S3StorageClientConfig {
  /** S3 bucket name */
  bucket: string
  /** AWS region */
  region: string
  /** Whether to make uploaded files public */
  publicRead?: boolean
}

/**
 * S3 implementation of StorageClient
 */
export class S3StorageClient implements StorageClient {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly publicRead: boolean

  constructor(config: S3StorageClientConfig, s3Client?: S3Client) {
    this.bucket = config.bucket
    this.publicRead = config.publicRead ?? true
    this.s3 = s3Client ?? new S3Client({
      region: config.region
    })
  }

  async uploadJson(key: string, data: unknown): Promise<void> {
    const body = JSON.stringify(data, this.bigIntReplacer)

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: 'application/json',
      ...(this.publicRead && { ACL: ObjectCannedACL.public_read })
    }

    try {
      await this.s3.send(new PutObjectCommand(params))
      logger.info(`Uploaded ${key} to ${this.bucket}`)
    } catch (error) {
      logger.error(`Failed to upload ${key} to ${this.bucket}`, error)
      throw new Error(`Failed to upload ${key}: ${error}`)
    }
  }

  /**
   * JSON replacer function to handle BigInt values
   * Converts to Number if safe, otherwise to string to preserve precision
   */
  private bigIntReplacer(_key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
      // Convert to string if value exceeds safe integer range to preserve precision
      if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
        return value.toString()
      }
      return Number(value)
    }
    return value
  }
}

/**
 * In-memory storage client for testing
 */
export class InMemoryStorageClient implements StorageClient {
  private readonly storage = new Map<string, unknown>()

  async uploadJson(key: string, data: unknown): Promise<void> {
    this.storage.set(key, data)
  }

  /**
   * Get stored data (for testing assertions)
   */
  get(key: string): unknown {
    return this.storage.get(key)
  }

  /**
   * Get all stored keys (for testing assertions)
   */
  keys(): string[] {
    return Array.from(this.storage.keys())
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    this.storage.clear()
  }
}

/**
 * Factory function to create an S3StorageClient
 */
export function createS3StorageClient(
  config: S3StorageClientConfig,
  s3Client?: S3Client
): StorageClient {
  return new S3StorageClient(config, s3Client)
}
