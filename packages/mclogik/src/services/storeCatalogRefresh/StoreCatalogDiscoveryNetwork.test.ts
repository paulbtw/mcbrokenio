import { describe, expect, it, vi } from 'vitest'

import { type RequestLimiter } from '../../constants/RateLimit'
import { type MarketDefinition } from '../../markets/MarketDefinitions'
import {
  APIType,
  IceType,
  type ILocation,
  UsLocations
} from '../../types'

import {
  StoreCatalogDiscoveryNetwork,
  type StoreCatalogDiscoveryNetworkDependencies} from './StoreCatalogDiscoveryNetwork'

const TEST_LIMITER: RequestLimiter = {
  concurrentRequests: 4,
  maxRequestsPerSecond: 1_000,
  requestsPerLog: 1_000
}
const LOCATION: ILocation = { latitude: 40, longitude: -70 }

function createMarket(
  scope = UsLocations.US,
  country = UsLocations.US
): MarketDefinition {
  return {
    country,
    catalogScope: scope,
    getStores: {
      api: APIType.US,
      url: 'https://example.com/stores?'
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

function createStore(id: string) {
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

function createDependencies(markets: MarketDefinition[] = [createMarket()]) {
  const discoverFromLocation = vi.fn().mockResolvedValue([createStore('US-1')])
  const dependencies: StoreCatalogDiscoveryNetworkDependencies = {
    loadRefreshContext: vi.fn().mockResolvedValue({
      token: 'bearer-token',
      clientId: 'client-id',
      markets
    }),
    generateLocationMesh: vi.fn().mockReturnValue([LOCATION]),
    discoverFromLocation,
    discoverFromUrl: vi.fn().mockResolvedValue([]),
    getRequestLimiter: vi.fn().mockReturnValue(TEST_LIMITER),
    getLocationIntervalKilometers: vi.fn().mockReturnValue(30)
  }

  return { dependencies, discoverFromLocation }
}

function axiosFailure(status = 503) {
  return Object.assign(new Error('upstream request failed'), {
    name: 'AxiosError',
    isAxiosError: true,
    code: 'ERR_BAD_RESPONSE',
    response: { status }
  })
}

describe('StoreCatalogDiscoveryNetwork', () => {
  it('authenticates once, owns location planning, and returns stable request order', async () => {
    const markets = [createMarket(UsLocations.US), createMarket(UsLocations.US2)]
    const { dependencies, discoverFromLocation } = createDependencies(markets)
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    discoverFromLocation.mockImplementation(
      async (_location: ILocation, market: MarketDefinition) => {
        if (market.catalogScope === UsLocations.US) {
          await firstGate
        } else {
          releaseFirst()
        }
        return [createStore(String(market.catalogScope))]
      }
    )
    const network = new StoreCatalogDiscoveryNetwork(dependencies)

    const batch = await network.discoverBatch({
      apiType: APIType.US,
      countryList: [UsLocations.US, UsLocations.US2]
    })

    expect(dependencies.loadRefreshContext).toHaveBeenCalledTimes(1)
    expect(dependencies.generateLocationMesh).toHaveBeenCalledTimes(2)
    expect(discoverFromLocation).toHaveBeenCalledTimes(2)
    expect(batch.outcomes.map((outcome) => outcome.scope)).toEqual([
      UsLocations.US,
      UsLocations.US2
    ])
    expect(batch.scopes).toEqual([
      { country: 'US', scope: UsLocations.US, plannedRequests: 1 },
      { country: 'US', scope: UsLocations.US2, plannedRequests: 1 }
    ])
    expect(batch.requestsByCountry).toEqual({ US: 2 })
  })

  it('returns expected failures as sanitized values without raw Axios data', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    discoverFromLocation.mockRejectedValue(
      Object.assign(
        new Error('https://secret.example?key=url-secret'),
        {
          name: 'AxiosError',
          isAxiosError: true,
          code: 'ERR_BAD_RESPONSE',
          config: {
            url: 'https://secret.example?key=url-secret',
            headers: { authorization: 'Bearer bearer-secret' }
          },
          response: {
            status: 429,
            data: {
              status: {
                code: 'RATE_LIMIT',
                type: 'TooManyRequests',
                service: 'store-search',
                message: 'client-secret'
              },
              raw: 'response-secret'
            }
          }
        }
      )
    )
    const network = new StoreCatalogDiscoveryNetwork(dependencies)

    const batch = await network.discoverBatch({ apiType: APIType.US })

    expect(batch.outcomes).toEqual([
      {
        index: 0,
        country: 'US',
        scope: UsLocations.US,
        stores: [],
        failure: {
          kind: 'http',
          retryable: true,
          status: 429,
          code: 'RATE_LIMIT',
          type: 'TooManyRequests',
          service: 'store-search',
          message: 'Upstream HTTP request failed'
        }
      }
    ])
    const serialized = JSON.stringify(batch)
    expect(serialized).not.toContain('secret.example')
    expect(serialized).not.toContain('bearer-secret')
    expect(serialized).not.toContain('client-secret')
    expect(serialized).not.toContain('response-secret')
  })

  it('opens the circuit breaker after repeated expected failures', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    vi.mocked(dependencies.generateLocationMesh).mockReturnValue(
      Array.from({ length: 32 }, (_, index) => ({
        latitude: index,
        longitude: -index
      }))
    )
    discoverFromLocation.mockRejectedValue(axiosFailure())
    const network = new StoreCatalogDiscoveryNetwork(dependencies)

    const batch = await network.discoverBatch({ apiType: APIType.US })

    expect(batch.circuitOpened).toBe(true)
    expect(discoverFromLocation.mock.calls.length).toBeGreaterThanOrEqual(24)
    expect(discoverFromLocation.mock.calls.length).toBeLessThanOrEqual(27)
    expect(batch.outcomes.every((outcome) => outcome.failure != null)).toBe(
      true
    )
  })

  it('rejects programming defects instead of exposing raw failures', async () => {
    const { dependencies, discoverFromLocation } = createDependencies()
    discoverFromLocation.mockRejectedValue(
      new TypeError('Unexpected response parser defect')
    )
    const network = new StoreCatalogDiscoveryNetwork(dependencies)

    await expect(
      network.discoverBatch({ apiType: APIType.US })
    ).rejects.toThrow('Unexpected response parser defect')
  })
})
