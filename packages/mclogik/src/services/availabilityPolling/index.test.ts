import { type Pos } from '@mcbroken/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  APIType,
  ApLocations,
  ElLocations,
  EuLocations,
  IceType,
  type Locations,
  UsLocations
} from '../../types'

import { pollAvailability } from './index'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
  getMetaForApi: vi.fn(),
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

vi.mock('../../utils/getMetaForApi', () => ({
  getMetaForApi: mocks.getMetaForApi
}))

vi.mock('../../clients/McdonaldsApiClient', () => ({
  createApiClient: mocks.createApiClient
}))

vi.mock('../../sentry', () => ({
  addBreadcrumb: mocks.addBreadcrumb,
  captureBatchSummary: mocks.captureBatchSummary
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
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

describe('pollAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.getMetaForApi.mockResolvedValue({
      token: 'bearer-token',
      clientId: 'client-id',
      countryInfos: [
        {
          country: UsLocations.US,
          getStores: {
            api: APIType.US,
            url: 'https://example.com'
          },
          productCodes: {
            [IceType.MILCHSHAKE]: ['SHAKE1'],
            [IceType.MCFLURRY]: ['FLURRY1'],
            [IceType.MCSUNDAE]: ['SUNDAE1']
          }
        }
      ]
    })
    mocks.findMany.mockResolvedValue([createStore()])
    mocks.fetchRestaurantOutages.mockResolvedValue({
      outageProductCodes: ['SHAKE1']
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
      countryList: [UsLocations.US]
    })

    expect(mocks.getMetaForApi).toHaveBeenCalledWith(
      APIType.US,
      [UsLocations.US],
      true
    )
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        country: { in: ['US'] },
        hasMobileOrdering: true
      },
      take: 2000,
      orderBy: { updatedAt: 'asc' }
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
        milkshakeStatus: 'UNAVAILABLE',
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
      countryBreakdown: {
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

  it('rejects credential failures before selecting stores', async () => {
    mocks.getMetaForApi.mockRejectedValue(new Error('Credential lookup failed'))

    await expect(pollAvailability({ apiType: APIType.US })).rejects.toThrow(
      'Credential lookup failed'
    )

    expect(mocks.findMany).not.toHaveBeenCalled()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it.each([
    [APIType.AP, ApLocations.AU],
    [APIType.EL, ElLocations.AT],
    [APIType.EU, EuLocations.DE]
  ])('owns rate policy for the %s polling region', async (apiType, country) => {
    mocks.getMetaForApi.mockResolvedValue({
      token: 'bearer-token',
      clientId: 'client-id',
      countryInfos: [
        {
          country,
          getStores: { api: apiType, url: 'https://example.com' },
          productCodes: {
            [IceType.MILCHSHAKE]: ['SHAKE1'],
            [IceType.MCFLURRY]: ['FLURRY1'],
            [IceType.MCSUNDAE]: ['SUNDAE1']
          }
        }
      ]
    })
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

  it('rejects an empty bearer token before selecting stores', async () => {
    mocks.getMetaForApi.mockResolvedValue({
      token: '',
      clientId: 'client-id',
      countryInfos: []
    })

    await expect(pollAvailability({ apiType: APIType.US })).rejects.toThrow(
      'Bearer token is missing for US'
    )

    expect(mocks.findMany).not.toHaveBeenCalled()
  })

  it('rejects malformed store updates before opening a transaction', async () => {
    mocks.findMany.mockResolvedValue([
      createStore({ id: undefined as unknown as string })
    ])

    await expect(pollAvailability({ apiType: APIType.US })).rejects.toThrow(
      'Availability update is missing a store id'
    )

    expect(mocks.transaction).not.toHaveBeenCalled()
  })
})
