import { describe, expect, it, vi } from 'vitest'

import { type RequestLimiter } from '../constants/RateLimit'

import {
  createRateLimitedExecutor,
  RateLimitedExecutor
} from './RateLimitedExecutor'

describe('RateLimitedExecutor', () => {
  const createLimiter = (
    overrides: Partial<RequestLimiter> = {}
  ): RequestLimiter => ({
    maxRequestsPerSecond: 10,
    requestsPerLog: 5,
    concurrentRequests: 3,
    ...overrides
  })

  describe('executeAll', () => {
    it('should execute all items and return results', async () => {
      const limiter = createLimiter()
      const executor = new RateLimitedExecutor({ limiter })

      const items = [1, 2, 3, 4, 5]
      const executorFn = vi.fn().mockImplementation(async (n: number) => n * 2)

      const result = await executor.executeAll(items, executorFn)

      expect(result.totalProcessed).toBe(5)
      expect(result.failures).toBe(0)
      expect(result.results).toHaveLength(5)
      expect(result.results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10])
    })

    it('should handle empty items array', async () => {
      const limiter = createLimiter()
      const executor = new RateLimitedExecutor({ limiter })

      const items: number[] = []
      const executorFn = vi.fn()

      const result = await executor.executeAll(items, executorFn)

      expect(result.totalProcessed).toBe(0)
      expect(result.failures).toBe(0)
      expect(result.results).toEqual([])
      expect(executorFn).not.toHaveBeenCalled()
    })

    it('should count null results as failures', async () => {
      const limiter = createLimiter()
      const executor = new RateLimitedExecutor({ limiter })

      const items = [1, 2, 3, 4, 5]
      const executorFn = vi
        .fn()
        .mockImplementation(async (n: number) => (n % 2 === 0 ? n : null))

      const result = await executor.executeAll(items, executorFn)

      expect(result.totalProcessed).toBe(5)
      expect(result.failures).toBe(3) // 1, 3, 5 return null
      expect(result.results).toHaveLength(2)
      expect(result.results.sort()).toEqual([2, 4])
    })

    it('should count thrown errors as failures', async () => {
      const limiter = createLimiter()
      const executor = new RateLimitedExecutor({ limiter })

      const items = [1, 2, 3]
      const executorFn = vi.fn().mockImplementation(async (n: number) => {
        if (n === 2) {
          throw new Error('Test error')
        }
        return n
      })

      const result = await executor.executeAll(items, executorFn)

      expect(result.totalProcessed).toBe(3)
      expect(result.failures).toBe(1)
      expect(result.results).toHaveLength(2)
    })

    it('should respect concurrency limit', async () => {
      const limiter = createLimiter({ concurrentRequests: 2 })
      const executor = new RateLimitedExecutor({ limiter })

      let maxConcurrent = 0
      let currentConcurrent = 0

      const items = [1, 2, 3, 4, 5]
      const executorFn = vi.fn().mockImplementation(async (n: number) => {
        currentConcurrent++
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent)

        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 10))

        currentConcurrent--
        return n
      })

      await executor.executeAll(items, executorFn)

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('should process items with different types', async () => {
      const limiter = createLimiter()
      const executor = new RateLimitedExecutor({ limiter })

      interface InputItem {
        id: string
        value: number
      }

      interface OutputItem {
        id: string
        doubled: number
      }

      const items: InputItem[] = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 }
      ]

      const executorFn = vi
        .fn()
        .mockImplementation(async (item: InputItem): Promise<OutputItem> => ({
          id: item.id,
          doubled: item.value * 2
        }))

      const result = await executor.executeAll(items, executorFn)

      expect(result.results).toHaveLength(3)
      expect(result.results).toContainEqual({ id: 'a', doubled: 2 })
      expect(result.results).toContainEqual({ id: 'b', doubled: 4 })
      expect(result.results).toContainEqual({ id: 'c', doubled: 6 })
    })
  })

  describe('createRateLimitedExecutor', () => {
    it('should create an executor with the given limiter', async () => {
      const limiter = createLimiter()
      const executor = createRateLimitedExecutor(limiter)

      expect(executor).toBeInstanceOf(RateLimitedExecutor)

      // Verify it works
      const result = await executor.executeAll([1, 2], async (n) => n)
      expect(result.totalProcessed).toBe(2)
    })

    it('should accept optional logger name', () => {
      const limiter = createLimiter()
      const executor = createRateLimitedExecutor(limiter, 'TestLogger')

      expect(executor).toBeInstanceOf(RateLimitedExecutor)
    })
  })
})
