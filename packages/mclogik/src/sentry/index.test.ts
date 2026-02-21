import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  addBreadcrumb,
  type BatchSummary,
  captureBatchSummary
} from './index'

vi.mock('@sentry/aws-serverless', () => {
  const mockScope = {
    setTag: vi.fn(),
    setLevel: vi.fn(),
    setFingerprint: vi.fn(),
    setContext: vi.fn(),
  }

  return {
    init: vi.fn(),
    wrapHandler: vi.fn((handler: unknown) => handler),
    withScope: vi.fn((callback: (scope: typeof mockScope) => void) => {
      callback(mockScope)
    }),
    captureMessage: vi.fn(),
    captureException: vi.fn(),
    addBreadcrumb: vi.fn(),
    __mockScope: mockScope,
  }
})

const Sentry = await import('@sentry/aws-serverless') as unknown as {
  withScope: ReturnType<typeof vi.fn>
  captureMessage: ReturnType<typeof vi.fn>
  captureException: ReturnType<typeof vi.fn>
  addBreadcrumb: ReturnType<typeof vi.fn>
  __mockScope: {
    setTag: ReturnType<typeof vi.fn>
    setLevel: ReturnType<typeof vi.fn>
    setFingerprint: ReturnType<typeof vi.fn>
    setContext: ReturnType<typeof vi.fn>
  }
}

describe('captureBatchSummary', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const createSummary = (overrides: Partial<BatchSummary> = {}): BatchSummary => ({
    apiType: 'EU',
    totalStores: 100,
    successCount: 95,
    failedCount: 5,
    countryBreakdown: {
      DE: { total: 50, failed: 3 },
      ES: { total: 50, failed: 2 },
    },
    durationMs: 30000,
    ...overrides,
  })

  it('should not fire when failure rate is below 10% and no country fully down', () => {
    captureBatchSummary(createSummary({
      failedCount: 5,
      totalStores: 100,
    }))

    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('should not fire when totalStores is 0', () => {
    captureBatchSummary(createSummary({
      totalStores: 0,
      failedCount: 0,
    }))

    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('should fire error level when a country is fully down', () => {
    captureBatchSummary(createSummary({
      failedCount: 50,
      totalStores: 100,
      countryBreakdown: {
        DE: { total: 50, failed: 0 },
        ES: { total: 50, failed: 50 },
      },
    }))

    expect(Sentry.withScope).toHaveBeenCalled()
    expect(Sentry.__mockScope.setTag).toHaveBeenCalledWith('api_type', 'EU')
    expect(Sentry.__mockScope.setLevel).toHaveBeenCalledWith('error')
    expect(Sentry.__mockScope.setFingerprint).toHaveBeenCalledWith(['EU', 'batch-failure'])
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('ES fully down'),
      'error'
    )
  })

  it('should fire warning level when failure rate exceeds 10% but no country fully down', () => {
    captureBatchSummary(createSummary({
      failedCount: 20,
      totalStores: 100,
      successCount: 80,
      countryBreakdown: {
        DE: { total: 50, failed: 10 },
        ES: { total: 50, failed: 10 },
      },
    }))

    expect(Sentry.withScope).toHaveBeenCalled()
    expect(Sentry.__mockScope.setLevel).toHaveBeenCalledWith('warning')
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('high failure rate'),
      'warning'
    )
  })

  it('should include country breakdown in context', () => {
    const breakdown = {
      DE: { total: 50, failed: 0 },
      ES: { total: 50, failed: 50 },
    }

    captureBatchSummary(createSummary({
      failedCount: 50,
      totalStores: 100,
      countryBreakdown: breakdown,
    }))

    expect(Sentry.__mockScope.setContext).toHaveBeenCalledWith(
      'country_breakdown',
      breakdown
    )
    expect(Sentry.__mockScope.setContext).toHaveBeenCalledWith(
      'batch_summary',
      expect.objectContaining({
        totalStores: 100,
        failedCount: 50,
        countriesFullyDown: ['ES'],
      })
    )
  })

  it('should list multiple fully-down countries', () => {
    captureBatchSummary(createSummary({
      failedCount: 100,
      totalStores: 100,
      successCount: 0,
      countryBreakdown: {
        ES: { total: 50, failed: 50 },
        FR: { total: 50, failed: 50 },
      },
    }))

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('ES, FR fully down'),
      'error'
    )
  })

  it('should fire at exactly 10% boundary', () => {
    captureBatchSummary(createSummary({
      failedCount: 10,
      totalStores: 100,
      countryBreakdown: {
        DE: { total: 50, failed: 5 },
        ES: { total: 50, failed: 5 },
      },
    }))

    // 10% is the boundary — at exactly 10%, should NOT fire (> 10% required)
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('should fire just above 10% boundary', () => {
    captureBatchSummary(createSummary({
      failedCount: 11,
      totalStores: 100,
      countryBreakdown: {
        DE: { total: 50, failed: 6 },
        ES: { total: 50, failed: 5 },
      },
    }))

    expect(Sentry.captureMessage).toHaveBeenCalled()
  })
})

describe('addBreadcrumb', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call Sentry.addBreadcrumb with correct category', () => {
    addBreadcrumb('Processing started', { storeCount: 100 })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'mcbroken',
      message: 'Processing started',
      data: { storeCount: 100 },
      level: 'info',
    })
  })

  it('should work without data parameter', () => {
    addBreadcrumb('Simple message')

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'mcbroken',
      message: 'Simple message',
      data: undefined,
      level: 'info',
    })
  })
})
