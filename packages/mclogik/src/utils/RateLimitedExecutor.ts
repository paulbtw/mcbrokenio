import { Logger } from '@sailplane/logger'
import PQueue from 'p-queue'

import { type RequestLimiter } from '../constants/RateLimit'

const logger = new Logger('RateLimitedExecutor')

/**
 * Options for rate-limited execution
 */
export interface RateLimitedExecutorOptions {
  /** Rate limiting configuration */
  limiter: RequestLimiter
  /** Optional logger name */
  loggerName?: string
}

/**
 * Result of batch execution
 */
export interface BatchExecutionResult<T> {
  /** Successfully processed results */
  results: T[]
  /** Total items processed (including failures) */
  totalProcessed: number
  /** Number of failures */
  failures: number
}

/**
 * Executes async operations with rate limiting
 * Extracted from getItemStatus to be reusable and testable
 */
export class RateLimitedExecutor {
  private readonly limiter: RequestLimiter
  private readonly executorLogger: Logger

  constructor(options: RateLimitedExecutorOptions) {
    this.limiter = options.limiter
    this.executorLogger = options.loggerName
      ? new Logger(options.loggerName)
      : logger
  }

  /**
   * Execute an async operation for each item with rate limiting
   *
   * @param items - Items to process
   * @param executor - Async function to execute for each item
   * @returns Results of successful executions
   */
  async executeAll<TInput, TOutput>(
    items: TInput[],
    executor: (item: TInput) => Promise<TOutput | null>
  ): Promise<BatchExecutionResult<TOutput>> {
    const queue = new PQueue({
      concurrency: this.limiter.concurrentRequests
    })

    const results: TOutput[] = []
    let requestsThisSecond = 0
    let totalProcessed = 0
    let failures = 0

    const tasks = items.map((item) =>
      queue.add(async () => {
        // Rate limiting
        if (requestsThisSecond >= this.limiter.maxRequestsPerSecond) {
          await this.sleep(1000)
          requestsThisSecond = 0
        }

        requestsThisSecond++
        totalProcessed++

        // Progress logging
        if (totalProcessed % this.limiter.requestsPerLog === 0) {
          this.executorLogger.debug(`Processed ${totalProcessed}/${items.length}`)
        }

        try {
          const result = await executor(item)
          if (result !== null) {
            results.push(result)
          } else {
            failures++
          }
        } catch (error) {
          failures++
          this.executorLogger.error(`Error processing item: ${error}`)
        }
      })
    )

    await Promise.all(tasks)

    this.executorLogger.info(
      `Completed: ${results.length} successful, ${failures} failed out of ${totalProcessed} total`
    )

    return {
      results,
      totalProcessed,
      failures
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Factory function to create a RateLimitedExecutor
 */
export function createRateLimitedExecutor(
  limiter: RequestLimiter,
  loggerName?: string
): RateLimitedExecutor {
  return new RateLimitedExecutor({ limiter, loggerName })
}
