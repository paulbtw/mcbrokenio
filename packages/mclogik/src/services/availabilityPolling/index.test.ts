import { type Pos } from '@mcbroken/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  APIType,
  ApLocations,
  asMarketCode,
  ElLocations,
  EuLocations,
  type Locations,
  UsLocations
} from '../../types'

import { pollAvailability, resolveLegacyAvailabilityMarkets } from './index'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
  getBearerToken: vi.fn(),
  getClientId: vi.fn(),
  fetchRestaurantOutages: vi.fn(),
  createApiClient: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureBatchSummary: vi.fn()
}))

vi.mock('@mcbroken/db/client', () => ({
  prisma: {
    pos: {
      findMany: mocks.findMany,
      update: mocks.update
    },
    $transaction: mocks.transaction
  }
}))

vi.mock('../token/getBearerToken', () => ({
  getBearerToken: mocks.getBearerToken
}))

vi.mock('../token/getClientId', () => ({
  getClientId: mocks.getClientId
}))

vi.mock('../../clients/McdonaldsApiClient', () => ({
  createApiClient: mocks.createApiClient
}))

vi.mock('../../sentry', () => ({
  addBreadcrumb: mocks.addBreadcrumb,
  captureBatchSummary: mocks.captureBatchSummary
}))

vi.mock('../../utils/RateLimitedExecutor', () => ({
  createRateLimitedExecutor: () => ({
    async executeAll(
      items: unknown[],
      executor: (item: unknown) => Promise<unknown | null>
    ) {
      const values = await Promise.all(items.map(executor))
      const results = values.filter((value) => value !== null)

      return {
        results,
        totalProcessed: items.length,
        failures: values.length - results.length
      }
    }
  })
}))

function createStore(overrides: Partial<Pos> = {}): Pos {
  return {
    id: 'US-12345',
    nationalStoreNumber: '12345',
    name: 'Test Store',
    latitude: '40.7128',
    longitude: '-74.0060',
    country: 'US',
    hasMobileOrdering: true,
    errorCounter: 2,
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

describe('pollAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.getBearerToken.mockResolvedValue('bearer-token')
    mocks.getClientId.mockReturnValue('client-id')
    mocks.findMany.mockResolvedValue([createStore()])
    mocks.fetchRestaurantOutages.mockResolvedValue({
      outageProductCodes: ['1598']
    })
    mocks.createApiClient.mockReturnValue({
      apiType: APIType.US,
      fetchRestaurantOutages: mocks.fetchRestaurantOutages
    })
    mocks.update.mockResolvedValue({})
    mocks.transaction.mockImplementation(async (updates: Promise<unknown>[]) =>
      Promise.all(updates)
    )
  })

  it('composes the deep production module behind one public facade', async () => {
    const result = await pollAvailability({
      apiType: APIType.US,
      markets: [asMarketCode(UsLocations.US)]
    })

    expect(mocks.getBearerToken).toHaveBeenCalledWith(APIType.US)
    expect(mocks.getClientId).toHaveBeenCalledWith(APIType.US)
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        country: { in: ['US'] },
        hasMobileOrdering: true,
        closedAt: null
      },
      take: 2000,
      orderBy: { updatedAt: 'asc' },
      select: {
        id: true,
        nationalStoreNumber: true,
        country: true,
        errorCounter: true
      }
    })
    expect(mocks.createApiClient).toHaveBeenCalledWith(APIType.US)
    expect(mocks.fetchRestaurantOutages).toHaveBeenCalledWith('12345', {
      authorization: 'Bearer bearer-token',
      clientId: 'client-id',
      marketId: 'US'
    })
    expect(mocks.transaction).toHaveBeenCalledTimes(1)
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'US-12345' },
      data: expect.objectContaining({
        milkshakeStatus: 'PARTIAL_AVAILABLE',
        mcFlurryStatus: 'AVAILABLE',
        mcSundaeStatus: 'AVAILABLE',
        errorCounter: 0,
        isResponsive: true,
        lastChecked: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
    expect(result).toMatchObject({
      totalStores: 1,
      successCount: 1,
      failedCount: 0,
      skippedCount: 0,
      marketBreakdown: {
        US: { total: 1, success: 1, failed: 0, skipped: 0 }
      }
    })
    expect(mocks.captureBatchSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        apiType: APIType.US,
        totalStores: 1,
        successCount: 1,
        failedCount: 0
      })
    )
  })

  it('collapses legacy US2 Catalog Scope input to the US Market boundary', () => {
    expect(
      resolveLegacyAvailabilityMarkets(APIType.US, [UsLocations.US2])
    ).toEqual([UsLocations.US])
  })

  it('rejects credential failures without persisting store health', async () => {
    mocks.getBearerToken.mockRejectedValue(
      new Error('Credential lookup failed')
    )

    await expect(pollAvailability({ apiType: APIType.US })).rejects.toThrow(
      'Credential lookup failed'
    )

    expect(mocks.findMany).toHaveBeenCalledTimes(1)
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it.each([
    [APIType.AP, ApLocations.AU],
    [APIType.EL, ElLocations.AT],
    [APIType.EU, EuLocations.DE]
  ])('owns rate policy for the %s polling region', async (apiType, country) => {
    mocks.findMany.mockResolvedValue([
      createStore({
        id: `${country}-12345`,
        country: country as Locations
      })
    ])

    const result = await pollAvailability({ apiType })

    expect(result.successCount).toBe(1)
    expect(mocks.createApiClient).toHaveBeenCalledWith(apiType)
  })

  it('rejects unsupported polling regions', async () => {
    await expect(pollAvailability({ apiType: APIType.HK })).rejects.toThrow(
      'Availability polling is not supported for HK'
    )

    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('rejects an empty bearer token without persisting store health', async () => {
    mocks.getBearerToken.mockResolvedValue('')

    await expect(pollAvailability({ apiType: APIType.US })).rejects.toThrow(
      'Bearer token is missing for US'
    )

    expect(mocks.findMany).toHaveBeenCalledTimes(1)
    expect(mocks.transaction).not.toHaveBeenCalled()
  })
})
