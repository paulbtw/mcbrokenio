import { describe, expect, it, vi } from 'vitest'

import {
  APIType,
  asCatalogScope,
  asMarketCode,
  type CreatePos,
  UsLocations
} from '../../types'

import {
  type StoreCatalogRefreshDependencies,
  StoreCatalogRefreshModule
} from './StoreCatalogRefreshModule'

const US_MARKET = asMarketCode(UsLocations.US)
const US_SCOPE = asCatalogScope(UsLocations.US)
const US2_SCOPE = asCatalogScope(UsLocations.US2)

function createStore(id: string): CreatePos {
  return {
    id,
    nationalStoreNumber: id,
    name: id,
    latitude: '1',
    longitude: '2',
    country: 'US',
    hasMobileOrdering: true
  }
}

function successfulBatch() {
  return {
    requestsByMarket: { US: 2 },
    scopes: [
      { market: US_MARKET, catalogScope: US_SCOPE, plannedRequests: 1 },
      { market: US_MARKET, catalogScope: US2_SCOPE, plannedRequests: 1 }
    ],
    skippedMarkets: 0,
    circuitOpened: false,
    outcomes: [
      {
        index: 0,
        market: US_MARKET,
        catalogScope: US_SCOPE,
        stores: [createStore('US-1')]
      },
      {
        index: 1,
        market: US_MARKET,
        catalogScope: US2_SCOPE,
        stores: [createStore('US-1'), createStore('US-2')]
      }
    ]
  }
}

function createDependencies(): StoreCatalogRefreshDependencies {
  return {
    discoverStoreCatalogBatch: vi.fn().mockResolvedValue(successfulBatch()),
    recordScopeRefresh: vi.fn().mockImplementation(async ({ stores }) => ({
      storesPersisted: stores.length,
      scopeCompleted: true,
      cycleFinalized: false,
      reconciliationSkipped: false,
      storesMarkedMissing: 0,
      storesClosed: 0,
      storesPurged: 0
    })),
    getExpectedCatalogScopes: vi
      .fn()
      .mockReturnValue([UsLocations.US, UsLocations.US2]),
    getCatalogCycleId: vi.fn().mockReturnValue('2026-08-02'),
    currentDate: vi.fn().mockReturnValue(new Date('2026-08-11T08:00:00.000Z')),
    logDiscoveryFailure: vi.fn(),
    now: vi.fn().mockReturnValueOnce(1_000).mockReturnValue(1_300)
  }
}

describe('StoreCatalogRefreshModule', () => {
  it('persists ordered scope observations and deduplicates the batch summary', async () => {
    const dependencies = createDependencies()
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({
      apiType: APIType.US,
      catalogScopes: [US_SCOPE, US2_SCOPE]
    })

    expect(dependencies.discoverStoreCatalogBatch).toHaveBeenCalledWith({
      apiType: APIType.US,
      catalogScopes: [UsLocations.US, UsLocations.US2]
    })
    expect(dependencies.recordScopeRefresh).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        country: 'US',
        scope: UsLocations.US,
        complete: true,
        stores: [expect.objectContaining({ id: 'US-1' })]
      })
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        country: 'US',
        scope: UsLocations.US2,
        complete: true,
        stores: [
          expect.objectContaining({ id: 'US-1' }),
          expect.objectContaining({ id: 'US-2' })
        ]
      })
    )
    expect(result).toEqual({
      totalRequests: 2,
      successfulRequests: 2,
      failedRequests: 0,
      skippedMarkets: 0,
      storesDiscovered: 2,
      storesPersisted: 2,
      marketBreakdown: {
        US: { requests: 2, successful: 2, failed: 0, stores: 2 }
      },
      durationMs: 300
    })
  })

  it('persists partial observations as incomplete before rejecting for retry', async () => {
    const dependencies = createDependencies()
    const failure = {
      kind: 'http' as const,
      retryable: true,
      status: 503,
      message: 'Upstream HTTP request failed'
    }
    vi.mocked(dependencies.discoverStoreCatalogBatch).mockResolvedValue({
      requestsByMarket: { US: 2 },
      scopes: [
        { market: US_MARKET, catalogScope: US_SCOPE, plannedRequests: 2 }
      ],
      skippedMarkets: 0,
      circuitOpened: false,
      outcomes: [
        {
          index: 0,
          market: US_MARKET,
          catalogScope: US_SCOPE,
          stores: [],
          failure
        },
        {
          index: 1,
          market: US_MARKET,
          catalogScope: US_SCOPE,
          stores: [createStore('US-2')]
        }
      ]
    })
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      '1 of 2 store discovery requests failed'
    )
    expect(dependencies.logDiscoveryFailure).toHaveBeenCalledWith(failure, {
      apiType: APIType.US,
      market: 'US'
    })
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        complete: false,
        stores: [expect.objectContaining({ id: 'US-2' })]
      })
    )
  })

  it('persists an incomplete scope when the circuit breaker cancels queued work', async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.discoverStoreCatalogBatch).mockResolvedValue({
      requestsByMarket: { US: 30 },
      scopes: [
        { market: US_MARKET, catalogScope: US_SCOPE, plannedRequests: 30 }
      ],
      skippedMarkets: 0,
      circuitOpened: true,
      outcomes: Array.from({ length: 24 }, (_, index) => ({
        index,
        market: US_MARKET,
        catalogScope: US_SCOPE,
        stores: [],
        failure: {
          kind: 'http' as const,
          retryable: true,
          status: 503,
          message: 'Upstream HTTP request failed'
        }
      }))
    })
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      'Store discovery aborted after repeated failures'
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({ complete: false, stores: [] })
    )
  })

  it('does not persist when the network batch rejects during auth or configuration', async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.discoverStoreCatalogBatch).mockRejectedValue(
      new Error('Credential lookup failed')
    )
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      'Credential lookup failed'
    )
    expect(dependencies.recordScopeRefresh).not.toHaveBeenCalled()
  })

  it('returns an empty result when the batch has no planned discovery work', async () => {
    const dependencies = createDependencies()
    vi.mocked(dependencies.discoverStoreCatalogBatch).mockResolvedValue({
      requestsByMarket: {},
      scopes: [],
      skippedMarkets: 1,
      circuitOpened: false,
      outcomes: []
    })
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.EU })).resolves.toEqual({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      skippedMarkets: 1,
      storesDiscovered: 0,
      storesPersisted: 0,
      marketBreakdown: {},
      durationMs: 300
    })
    expect(dependencies.recordScopeRefresh).not.toHaveBeenCalled()
  })
})
