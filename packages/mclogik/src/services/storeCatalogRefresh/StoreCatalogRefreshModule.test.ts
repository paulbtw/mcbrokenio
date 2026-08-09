import { describe, expect, it, vi } from 'vitest'

import { type RequestLimiter } from '../../constants/RateLimit'
import { type CreatePos } from '../../types'
import {
  APIType,
  EuLocations,
  IceType,
  type ICountryInfos,
  type ILocation,
  UsLocations
} from '../../types'

import {
  type StoreCatalogRefreshDependencies,
  StoreCatalogRefreshModule
} from './StoreCatalogRefreshModule'

const TEST_LIMITER: RequestLimiter = {
  concurrentRequests: 4,
  maxRequestsPerSecond: 100,
  requestsPerLog: 100
}
const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 24
const MAX_REQUESTS_STARTED_AFTER_ABORT =
  CIRCUIT_BREAKER_FAILURE_THRESHOLD + TEST_LIMITER.concurrentRequests - 1
const REQUESTS_BEYOND_BREAKER_THRESHOLD =
  MAX_REQUESTS_STARTED_AFTER_ABORT + TEST_LIMITER.concurrentRequests

const LOCATION: ILocation = { latitude: 40, longitude: -70 }

function createCountryInfo(
  country: UsLocations | EuLocations = UsLocations.US,
  apiType = APIType.US
): ICountryInfos {
  return {
    country,
    getStores: {
      api: apiType,
      url: 'https://example.com/stores?',
      mobileString: 'MOBILEORDERS'
    },
    locationLimits: {
      minLatitude: 1,
      maxLatitude: 2,
      minLongitude: 3,
      maxLongitude: 4
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  }
}

function createStore(
  id: string,
  country = 'US',
  nationalStoreNumber = '123'
): CreatePos {
  return {
    id,
    nationalStoreNumber,
    name: `Store ${id}`,
    latitude: '40',
    longitude: '-70',
    hasMobileOrdering: true,
    country
  }
}

function createDependencies(
  countryInfos: ICountryInfos[] = [createCountryInfo()]
) {
  const discoverFromLocation = vi.fn().mockResolvedValue([createStore('US-1')])
  const discoverFromUrl = vi.fn().mockResolvedValue([createStore('AT-1', 'AT')])

  const dependencies: StoreCatalogRefreshDependencies = {
    loadRefreshContext: vi.fn().mockResolvedValue({
      token: 'token',
      clientId: 'client-id',
      countryInfos
    }),
    generateLocationMesh: vi.fn().mockReturnValue([LOCATION]),
    discoverFromLocation,
    discoverFromUrl,
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
      .mockImplementation((_apiType, country) => [country]),
    getCatalogCycleId: vi.fn().mockReturnValue('2026-08-02'),
    currentDate: vi.fn().mockReturnValue(new Date('2026-08-08T10:00:00.000Z')),
    getRequestLimiter: vi.fn().mockReturnValue(TEST_LIMITER),
    getLocationIntervalKilometers: vi.fn().mockReturnValue(30),
    logDiscoveryFailure: vi.fn(),
    now: vi.fn().mockReturnValueOnce(1_000).mockReturnValue(1_300)
  }

  return { dependencies, discoverFromLocation, discoverFromUrl }
}

describe('StoreCatalogRefreshModule', () => {
  it('discovers, deduplicates by globally scoped id, and persists once', async () => {
    const countryInfos = [
      createCountryInfo(UsLocations.US),
      createCountryInfo(UsLocations.US2)
    ]
    const { dependencies, discoverFromLocation } =
      createDependencies(countryInfos)
    discoverFromLocation
      .mockResolvedValueOnce([createStore('US-123', 'US', '123')])
      .mockResolvedValueOnce([createStore('US2-123', 'US2', '123')])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({
      apiType: APIType.US,
      countryList: [UsLocations.US, UsLocations.US2]
    })

    expect(dependencies.loadRefreshContext).toHaveBeenCalledWith(APIType.US, [
      UsLocations.US,
      UsLocations.US2
    ])
    expect(dependencies.getLocationIntervalKilometers).toHaveBeenCalledWith(
      APIType.US
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      totalRequests: 2,
      successfulRequests: 2,
      failedRequests: 0,
      skippedCountries: 0,
      storesDiscovered: 2,
      storesPersisted: 2,
      countryBreakdown: {
        US: { requests: 1, successful: 1, failed: 0, stores: 1 },
        US2: { requests: 1, successful: 1, failed: 0, stores: 1 }
      },
      durationMs: 300
    })
  })

  it('combines request outcomes for geographic slices sharing a country code', async () => {
    const countryInfos = [createCountryInfo(), createCountryInfo()]
    const { dependencies, discoverFromLocation } =
      createDependencies(countryInfos)
    discoverFromLocation
      .mockResolvedValueOnce([createStore('US-1')])
      .mockResolvedValueOnce([createStore('US-2')])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({ apiType: APIType.US })

    expect(result).toMatchObject({
      totalRequests: 2,
      successfulRequests: 2,
      failedRequests: 0,
      countryBreakdown: {
        US: { requests: 2, successful: 2, failed: 0, stores: 2 }
      }
    })
  })

  it('records partial discovery progress and rejects so Lambda can retry', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    vi.mocked(dependencies.generateLocationMesh).mockReturnValue([
      LOCATION,
      { latitude: 41, longitude: -71 }
    ])
    discoverFromLocation
      .mockRejectedValueOnce(new Error('upstream unavailable'))
      .mockResolvedValueOnce([createStore('US-2')])
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      '1 of 2 store discovery requests failed'
    )
    expect(dependencies.logDiscoveryFailure).toHaveBeenCalledTimes(1)
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        complete: false,
        stores: [expect.objectContaining({ id: 'US-2' })]
      })
    )
  })

  it('rejects when every discovery request fails so Lambda can retry', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    discoverFromLocation.mockRejectedValue(new Error('offline'))
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      'All store discovery requests failed'
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({ complete: false, stores: [] })
    )
  })

  it('stops discovery after repeated upstream failures', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    vi.mocked(dependencies.generateLocationMesh).mockReturnValue(
      Array.from({ length: REQUESTS_BEYOND_BREAKER_THRESHOLD }, (_, index) => ({
        latitude: index,
        longitude: -index
      }))
    )
    discoverFromLocation.mockRejectedValue(new Error('upstream unavailable'))
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      `Store discovery aborted after ${CIRCUIT_BREAKER_FAILURE_THRESHOLD} consecutive failures`
    )
    expect(discoverFromLocation.mock.calls.length).toBeGreaterThanOrEqual(
      CIRCUIT_BREAKER_FAILURE_THRESHOLD
    )
    expect(discoverFromLocation.mock.calls.length).toBeLessThanOrEqual(
      MAX_REQUESTS_STARTED_AFTER_ABORT
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({ complete: false, stores: [] })
    )
  })

  it('records successes completed before the breaker opens and rejects for retry', async () => {
    const countryInfos = [
      createCountryInfo(UsLocations.US),
      createCountryInfo(UsLocations.US2)
    ]
    const { dependencies, discoverFromLocation } =
      createDependencies(countryInfos)
    vi.mocked(dependencies.generateLocationMesh)
      .mockReturnValueOnce([LOCATION])
      .mockReturnValueOnce(
        Array.from(
          { length: REQUESTS_BEYOND_BREAKER_THRESHOLD },
          (_, index) => ({ latitude: index, longitude: -index })
        )
      )
    discoverFromLocation
      .mockResolvedValueOnce([createStore('US-1')])
      .mockRejectedValue(new Error('localized upstream failure'))
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      /store discovery requests failed/
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        complete: true,
        stores: [expect.objectContaining({ id: 'US-1' })]
      })
    )
  })

  it('uses URL discovery internally for EL markets', async () => {
    const countryInfo = createCountryInfo(UsLocations.US, APIType.EL)
    countryInfo.country = 'AT' as typeof countryInfo.country
    const { dependencies, discoverFromLocation, discoverFromUrl } =
      createDependencies([countryInfo])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({ apiType: APIType.EL })

    expect(discoverFromUrl).toHaveBeenCalledWith(countryInfo)
    expect(discoverFromLocation).not.toHaveBeenCalled()
    expect(dependencies.generateLocationMesh).not.toHaveBeenCalled()
    expect(result.storesPersisted).toBe(1)
  })

  it('preserves the existing UK exclusion as an explicit skip', async () => {
    const uk = createCountryInfo(EuLocations.UK, APIType.EU)
    const de = createCountryInfo(EuLocations.DE, APIType.EU)
    const { dependencies, discoverFromLocation } = createDependencies([uk, de])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({ apiType: APIType.EU })

    expect(result.skippedCountries).toBe(1)
    expect(discoverFromLocation).toHaveBeenCalledTimes(1)
  })

  it('returns an empty summary when no markets are configured', async () => {
    const { dependencies } = createDependencies([])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({ apiType: APIType.US })

    expect(result).toEqual({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      skippedCountries: 0,
      storesDiscovered: 0,
      storesPersisted: 0,
      countryBreakdown: {},
      durationMs: 300
    })
    expect(dependencies.recordScopeRefresh).not.toHaveBeenCalled()
  })

  it('rejects invalid location configuration before discovery', async () => {
    const countryInfo = createCountryInfo()
    delete countryInfo.locationLimits
    const { dependencies, discoverFromLocation } = createDependencies([
      countryInfo
    ])
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      'No locations found for US'
    )
    expect(discoverFromLocation).not.toHaveBeenCalled()
    expect(dependencies.recordScopeRefresh).not.toHaveBeenCalled()
  })

  it('rejects persistence failures', async () => {
    const { dependencies } = createDependencies()
    vi.mocked(dependencies.recordScopeRefresh).mockRejectedValue(
      new Error('transaction failed')
    )
    const module = new StoreCatalogRefreshModule(dependencies)

    await expect(module.refresh({ apiType: APIType.US })).rejects.toThrow(
      'transaction failed'
    )
  })

  it('records split geographic scopes separately while reconciling their shared country together', async () => {
    const us = createCountryInfo(UsLocations.US)
    us.catalogScope = UsLocations.US
    const us2 = createCountryInfo(UsLocations.US)
    us2.catalogScope = UsLocations.US2
    const { dependencies, discoverFromLocation } = createDependencies([us, us2])
    vi.mocked(dependencies.getExpectedCatalogScopes).mockReturnValue([
      UsLocations.US,
      UsLocations.US2
    ])
    discoverFromLocation
      .mockResolvedValueOnce([createStore('US-1')])
      .mockResolvedValueOnce([createStore('US-2')])
    const module = new StoreCatalogRefreshModule(dependencies)

    await module.refresh({ apiType: APIType.US })

    expect(dependencies.recordScopeRefresh).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        cycleId: '2026-08-02',
        country: 'US',
        scope: UsLocations.US,
        expectedScopes: [UsLocations.US, UsLocations.US2],
        complete: true,
        stores: [expect.objectContaining({ id: 'US-1' })]
      })
    )
    expect(dependencies.recordScopeRefresh).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        country: 'US',
        scope: UsLocations.US2,
        stores: [expect.objectContaining({ id: 'US-2' })]
      })
    )
  })

  it('preserves globally deduplicated result counts for overlapping scopes', async () => {
    const us = createCountryInfo(UsLocations.US)
    us.catalogScope = UsLocations.US
    const us2 = createCountryInfo(UsLocations.US)
    us2.catalogScope = UsLocations.US2
    const { dependencies, discoverFromLocation } = createDependencies([us, us2])
    vi.mocked(dependencies.getExpectedCatalogScopes).mockReturnValue([
      UsLocations.US,
      UsLocations.US2
    ])
    discoverFromLocation.mockResolvedValue([createStore('US-1')])
    const module = new StoreCatalogRefreshModule(dependencies)

    const result = await module.refresh({ apiType: APIType.US })

    expect(dependencies.recordScopeRefresh).toHaveBeenCalledTimes(2)
    expect(result.storesDiscovered).toBe(1)
    expect(result.storesPersisted).toBe(1)
  })
})
