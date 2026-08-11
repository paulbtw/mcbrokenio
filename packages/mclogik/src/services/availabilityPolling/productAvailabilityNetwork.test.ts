import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { InvalidUpstreamResponseError } from '../../clients/networkFailure'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type MarketDefinition } from '../../markets/marketDefinitions'
import {
  APIType,
  asCatalogScope,
  asMarketCode,
  IceType,
  UsLocations
} from '../../types'

import {
  ProductAvailabilityNetwork,
  type ProductAvailabilityNetworkDependencies
} from './productAvailabilityNetwork'

const TEST_LIMITER: RequestLimiter = {
  concurrentRequests: 4,
  maxRequestsPerSecond: 1_000,
  requestsPerLog: 1_000
}

function createStore(id: string, nationalStoreNumber: string): Pos {
  return {
    id,
    nationalStoreNumber,
    name: id,
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
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  }
}

function createMarket(): MarketDefinition {
  return {
    country: UsLocations.US,
    market: asMarketCode(UsLocations.US),
    catalogScope: asCatalogScope(UsLocations.US),
    getStores: { api: APIType.US, url: 'https://example.com' },
    productCodes: {
      [IceType.MILCHSHAKE]: ['shake'],
      [IceType.MCFLURRY]: ['flurry'],
      [IceType.MCSUNDAE]: ['sundae']
    }
  }
}

function createAvailability() {
  return {
    milkshake: { status: 'AVAILABLE' as const, count: 1, unavailable: 0 },
    mcFlurry: { status: 'AVAILABLE' as const, count: 1, unavailable: 0 },
    mcSundae: { status: 'AVAILABLE' as const, count: 1, unavailable: 0 },
    custom: []
  }
}

function createDependencies() {
  const fetchStoreProductAvailability = vi.fn()
  const dependencies: ProductAvailabilityNetworkDependencies = {
    loadPollContext: vi.fn().mockResolvedValue({
      token: 'bearer-token',
      clientId: 'client-id',
      markets: [createMarket()]
    }),
    createProductAvailabilityFetcher: vi.fn().mockReturnValue({
      fetchStoreProductAvailability
    }),
    getRequestLimiter: vi.fn().mockReturnValue(TEST_LIMITER)
  }

  return { dependencies, fetchStoreProductAvailability }
}

describe('ProductAvailabilityNetwork', () => {
  it('authenticates once, applies the regional batch, and returns stable input order', async () => {
    const { dependencies, fetchStoreProductAvailability } = createDependencies()
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    fetchStoreProductAvailability.mockImplementation(async (store: Pos) => {
      if (store.id === 'US-1') {
        await firstGate
      } else {
        releaseFirst()
      }
      return createAvailability()
    })
    const network = new ProductAvailabilityNetwork(dependencies)
    const stores = [createStore('US-1', '1'), createStore('US-2', '2')]

    const outcomes = await network.fetchBatch({
      apiType: APIType.US,
      markets: [asMarketCode(UsLocations.US)],
      stores
    })

    expect(dependencies.loadPollContext).toHaveBeenCalledTimes(1)
    expect(dependencies.loadPollContext).toHaveBeenCalledWith(APIType.US, [
      UsLocations.US
    ])
    expect(dependencies.createProductAvailabilityFetcher).toHaveBeenCalledTimes(
      1
    )
    expect(fetchStoreProductAvailability).toHaveBeenCalledTimes(2)
    expect(fetchStoreProductAvailability).toHaveBeenCalledWith(
      stores[0],
      expect.objectContaining({ country: UsLocations.US }),
      'bearer-token',
      'client-id'
    )
    expect(outcomes.map((outcome) => outcome.store.id)).toEqual([
      'US-1',
      'US-2'
    ])
    expect(outcomes.every((outcome) => outcome.outcome === 'success')).toBe(
      true
    )
  })

  it('returns expected request failures as a sanitized allowlisted value', async () => {
    const { dependencies, fetchStoreProductAvailability } = createDependencies()
    fetchStoreProductAvailability.mockRejectedValue(
      Object.assign(
        new Error('Request to https://secret.example?token=url-secret failed'),
        {
          name: 'AxiosError',
          isAxiosError: true,
          code: 'ERR_BAD_RESPONSE',
          config: {
            url: 'https://secret.example?token=url-secret',
            headers: { authorization: 'Bearer bearer-secret' }
          },
          response: {
            status: 503,
            data: {
              status: {
                code: 'UPSTREAM_DOWN',
                type: 'ServiceUnavailable',
                service: 'restaurant-api',
                message: 'client-secret'
              },
              bodySecret: 'response-secret'
            }
          }
        }
      )
    )
    const network = new ProductAvailabilityNetwork(dependencies)

    const outcomes = await network.fetchBatch({
      apiType: APIType.US,
      stores: [createStore('US-1', '1')]
    })

    expect(outcomes).toEqual([
      {
        outcome: 'failure',
        store: expect.objectContaining({ id: 'US-1' }),
        failure: {
          kind: 'http',
          retryable: true,
          status: 503,
          code: 'UPSTREAM_DOWN',
          type: 'ServiceUnavailable',
          service: 'restaurant-api',
          message: 'Upstream HTTP request failed'
        }
      }
    ])
    const serialized = JSON.stringify(outcomes)
    expect(serialized).not.toContain('secret.example')
    expect(serialized).not.toContain('bearer-secret')
    expect(serialized).not.toContain('client-secret')
    expect(serialized).not.toContain('response-secret')
  })

  it('returns malformed upstream payloads as typed invalid-response outcomes', async () => {
    const { dependencies, fetchStoreProductAvailability } = createDependencies()
    fetchStoreProductAvailability.mockRejectedValue(
      new InvalidUpstreamResponseError()
    )
    const network = new ProductAvailabilityNetwork(dependencies)

    await expect(
      network.fetchBatch({
        apiType: APIType.US,
        stores: [createStore('US-1', '1')]
      })
    ).resolves.toEqual([
      {
        outcome: 'failure',
        store: expect.objectContaining({ id: 'US-1' }),
        failure: {
          kind: 'invalid-response',
          retryable: true,
          message: 'Upstream response was invalid'
        }
      }
    ])
  })

  it('sanitizes expected authentication transport failures', async () => {
    const { dependencies } = createDependencies()
    vi.mocked(dependencies.loadPollContext).mockRejectedValue(
      Object.assign(new Error('Bearer secret at https://private.example'), {
        name: 'AxiosError',
        isAxiosError: true,
        config: { headers: { authorization: 'Bearer secret' } }
      })
    )
    const network = new ProductAvailabilityNetwork(dependencies)

    const failure = await network
      .fetchBatch({
        apiType: APIType.US,
        stores: [createStore('US-1', '1')]
      })
      .catch((error: unknown) => error)

    expect(failure).toMatchObject({
      name: 'NetworkFailureError',
      kind: 'network',
      retryable: true,
      message: 'Product Availability authentication request failed'
    })
    expect(JSON.stringify(failure)).not.toContain('private.example')
    expect(JSON.stringify(failure)).not.toContain('Bearer secret')
  })

  it('rejects batch-wide authentication failures without producing outcomes', async () => {
    const { dependencies } = createDependencies()
    vi.mocked(dependencies.loadPollContext).mockRejectedValue(
      new Error('Credential lookup failed')
    )
    const network = new ProductAvailabilityNetwork(dependencies)

    await expect(
      network.fetchBatch({
        apiType: APIType.US,
        stores: [createStore('US-1', '1')]
      })
    ).rejects.toThrow('Credential lookup failed')
    expect(dependencies.createProductAvailabilityFetcher).not.toHaveBeenCalled()
  })

  it('rejects programming defects instead of converting them to store health failures', async () => {
    const { dependencies, fetchStoreProductAvailability } = createDependencies()
    fetchStoreProductAvailability.mockRejectedValue(
      new TypeError('Unexpected response parser defect')
    )
    const network = new ProductAvailabilityNetwork(dependencies)

    await expect(
      network.fetchBatch({
        apiType: APIType.US,
        stores: [createStore('US-1', '1')]
      })
    ).rejects.toThrow('Unexpected response parser defect')
  })

  it('rejects unsupported regional protocols before authentication', async () => {
    const { dependencies } = createDependencies()
    const network = new ProductAvailabilityNetwork(dependencies)

    await expect(
      network.fetchBatch({
        apiType: APIType.HK,
        stores: [createStore('HK-1', '1')]
      })
    ).rejects.toThrow('Availability polling is not supported for HK')
    expect(dependencies.loadPollContext).not.toHaveBeenCalled()
  })
})
