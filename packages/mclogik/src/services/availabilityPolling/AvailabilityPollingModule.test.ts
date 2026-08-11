import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { APIType, asMarketCode, UsLocations } from '../../types'

import {
  type AvailabilityPollingDependencies,
  AvailabilityPollingModule,
  type AvailabilityPollRequest
} from './AvailabilityPollingModule'

function createStore(overrides: Partial<Pos> = {}): Pos {
  return {
    id: 'US-1',
    nationalStoreNumber: '1',
    name: 'Store',
    latitude: '1',
    longitude: '2',
    country: 'US',
    hasMobileOrdering: true,
    errorCounter: 0,
    isResponsive: true,
    mcFlurryCount: 0,
    mcFlurryError: 0,
    mcFlurryStatus: 'UNKNOWN',
    mcSundaeCount: 0,
    mcSundaeError: 0,
    mcSundaeStatus: 'UNKNOWN',
    milkshakeCount: 0,
    milkshakeError: 0,
    milkshakeStatus: 'UNKNOWN',
    customItems: [],
    lastChecked: null,
    lastCatalogSeenAt: new Date('2026-01-01T00:00:00.000Z'),
    lastCatalogSeenCycle: null,
    missingCatalogCycles: 0,
    lastMissingCatalogCycle: null,
    closedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

function createAvailability() {
  return {
    milkshake: {
      status: 'PARTIAL_AVAILABLE' as const,
      count: 2,
      unavailable: 1
    },
    mcFlurry: { status: 'AVAILABLE' as const, count: 1, unavailable: 0 },
    mcSundae: { status: 'UNAVAILABLE' as const, count: 1, unavailable: 1 },
    custom: []
  }
}

function createDependencies(stores: Pos[]) {
  const dependencies: AvailabilityPollingDependencies = {
    getDefaultMarkets: vi.fn().mockReturnValue([asMarketCode('US')]),
    findEligibleStores: vi.fn().mockResolvedValue(stores),
    fetchProductAvailabilityBatch: vi.fn(),
    persistUpdates: vi.fn().mockResolvedValue(undefined),
    addBreadcrumb: vi.fn(),
    captureBatchSummary: vi.fn(),
    logStoreFailure: vi.fn(),
    now: vi.fn().mockReturnValueOnce(1_000).mockReturnValue(1_250)
  }

  return dependencies
}

describe('AvailabilityPollingModule', () => {
  it('turns typed batch outcomes into availability and health updates', async () => {
    const success = createStore({ id: 'US-ok', errorCounter: 2 })
    const failed = createStore({ id: 'US-fail', errorCounter: 2 })
    const skipped = createStore({ id: 'US-skip', country: 'CA' })
    const dependencies = createDependencies([success, failed, skipped])
    vi.mocked(dependencies.fetchProductAvailabilityBatch).mockResolvedValue([
      {
        outcome: 'success',
        store: success,
        availability: createAvailability()
      },
      {
        outcome: 'failure',
        store: failed,
        failure: {
          kind: 'http',
          retryable: true,
          status: 503,
          code: 'UPSTREAM_DOWN',
          type: 'ServiceUnavailable',
          service: 'restaurant-api',
          message: 'Upstream HTTP request failed'
        }
      },
      {
        outcome: 'skipped',
        store: skipped,
        reason: 'market-not-configured'
      }
    ])
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({
      apiType: APIType.US,
      markets: [asMarketCode(UsLocations.US)]
    })

    expect(dependencies.findEligibleStores).toHaveBeenCalledWith(['US'])
    expect(dependencies.fetchProductAvailabilityBatch).toHaveBeenCalledWith({
      apiType: APIType.US,
      markets: [UsLocations.US],
      stores: [success, failed, skipped]
    })
    expect(dependencies.persistUpdates).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'US-ok',
        milkshakeStatus: 'PARTIAL_AVAILABLE',
        errorCounter: 0,
        isResponsive: true
      }),
      expect.objectContaining({
        id: 'US-fail',
        errorCounter: 3,
        isResponsive: false
      })
    ])
    expect(result).toEqual({
      totalStores: 3,
      successCount: 1,
      failedCount: 1,
      skippedCount: 1,
      marketBreakdown: {
        US: { total: 2, success: 1, failed: 1, skipped: 0 },
        CA: { total: 1, success: 0, failed: 0, skipped: 1 }
      },
      durationMs: 250
    })
    expect(dependencies.logStoreFailure).toHaveBeenCalledWith({
      signature:
        'US|US|http|true|503|UPSTREAM_DOWN|ServiceUnavailable|restaurant-api|Upstream HTTP request failed',
      apiType: APIType.US,
      market: 'US',
      storeId: 'US-fail',
      nationalStoreNumber: '1',
      kind: 'http',
      retryable: true,
      status: 503,
      code: 'UPSTREAM_DOWN',
      type: 'ServiceUnavailable',
      service: 'restaurant-api',
      message: 'Upstream HTTP request failed'
    })
  })

  it('rejects batch-wide auth or configuration failures without changing health', async () => {
    const dependencies = createDependencies([createStore()])
    vi.mocked(dependencies.fetchProductAvailabilityBatch).mockRejectedValue(
      new Error('Credential lookup failed')
    )
    const module = new AvailabilityPollingModule(dependencies)

    await expect(module.poll({ apiType: APIType.US })).rejects.toThrow(
      'Credential lookup failed'
    )
    expect(dependencies.persistUpdates).not.toHaveBeenCalled()
    expect(dependencies.logStoreFailure).not.toHaveBeenCalled()
    expect(dependencies.captureBatchSummary).not.toHaveBeenCalled()
  })

  it('groups and caps sanitized failure samples without affecting all updates', async () => {
    const stores = Array.from({ length: 7 }, (_, index) =>
      createStore({ id: `US-${index}`, nationalStoreNumber: String(index) })
    )
    const dependencies = createDependencies(stores)
    vi.mocked(dependencies.fetchProductAvailabilityBatch).mockResolvedValue(
      stores.map((store, index) => ({
        outcome: 'failure' as const,
        store,
        failure: {
          kind: 'http' as const,
          retryable: false,
          status: 400 + index,
          message: 'Upstream HTTP request failed'
        }
      }))
    )
    const module = new AvailabilityPollingModule(dependencies)

    await module.poll({ apiType: APIType.US })

    expect(dependencies.persistUpdates).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'US-0', errorCounter: 1 }),
        expect.objectContaining({ id: 'US-6', errorCounter: 1 })
      ])
    )
    expect(dependencies.logStoreFailure).toHaveBeenCalledTimes(5)
    expect(dependencies.captureBatchSummary).toHaveBeenCalledWith(
      expect.objectContaining({ sampleErrors: expect.any(Array) })
    )
    const summary = vi.mocked(dependencies.captureBatchSummary).mock
      .calls[0]?.[0]
    expect(summary?.sampleErrors).toHaveLength(5)
  })

  it('returns an empty summary without invoking the network batch', async () => {
    const dependencies = createDependencies([])
    const module = new AvailabilityPollingModule(dependencies)

    await expect(module.poll({ apiType: APIType.US })).resolves.toEqual({
      totalStores: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      marketBreakdown: {},
      durationMs: 250
    })
    expect(dependencies.fetchProductAvailabilityBatch).not.toHaveBeenCalled()
    expect(dependencies.persistUpdates).not.toHaveBeenCalled()
  })

  it('uses requested Markets directly instead of interpreting them as Catalog Scopes', async () => {
    const dependencies = createDependencies([])
    vi.mocked(dependencies.getDefaultMarkets).mockReturnValue([
      asMarketCode('CA')
    ])
    const module = new AvailabilityPollingModule(dependencies)
    const request = {
      apiType: APIType.US,
      markets: [asMarketCode(UsLocations.US)]
    } satisfies AvailabilityPollRequest

    await module.poll(request)

    expect(dependencies.findEligibleStores).toHaveBeenCalledWith(['US'])
  })

  it.each([APIType.HK, APIType.UNKNOWN])(
    'rejects unsupported %s polling before loading stores',
    async (apiType) => {
      const dependencies = createDependencies([])
      const module = new AvailabilityPollingModule(dependencies)

      await expect(module.poll({ apiType })).rejects.toThrow(
        `Availability polling is not supported for ${apiType}`
      )
      expect(dependencies.getDefaultMarkets).not.toHaveBeenCalled()
      expect(dependencies.findEligibleStores).not.toHaveBeenCalled()
    }
  )
})
