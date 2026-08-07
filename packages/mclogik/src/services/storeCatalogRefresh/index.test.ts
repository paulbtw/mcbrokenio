import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  APIType,
  ElLocations,
  EuLocations,
  IceType,
  UsLocations
} from '../../types'

import { refreshStoreCatalog } from './index'

const mocks = vi.hoisted(() => ({
  getMetaForApi: vi.fn(),
  generateCoordinatesMesh: vi.fn(),
  discoverFromLocation: vi.fn(),
  discoverFromUrl: vi.fn(),
  upsertMany: vi.fn()
}))

vi.mock('@mcbroken/db/client', () => ({ prisma: {} }))

vi.mock('../../utils/getMetaForApi', () => ({
  getMetaForApi: mocks.getMetaForApi
}))

vi.mock('../../utils/generateCoordinatesMesh', () => ({
  generateCoordinatesMesh: mocks.generateCoordinatesMesh
}))

vi.mock('../../repositories', () => ({
  createPosRepository: () => ({ upsertMany: mocks.upsertMany })
}))

vi.mock('../../clients/StoreDiscoveryClient', () => ({
  createStoreDiscoveryClient: () => ({
    discoverFromLocation: mocks.discoverFromLocation,
    discoverFromUrl: mocks.discoverFromUrl
  })
}))

function createCountryInfo(
  country: UsLocations | EuLocations | ElLocations,
  apiType: APIType
) {
  return {
    country,
    getStores: { api: apiType, url: 'https://example.com' },
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

describe('refreshStoreCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.generateCoordinatesMesh.mockReturnValue([
      { latitude: 1, longitude: 2 }
    ])
    mocks.discoverFromLocation.mockResolvedValue([
      {
        id: 'US-1',
        nationalStoreNumber: '1',
        name: 'Store',
        latitude: '1',
        longitude: '2',
        country: 'US',
        hasMobileOrdering: true
      }
    ])
    mocks.discoverFromUrl.mockResolvedValue([])
    mocks.upsertMany.mockImplementation(async (stores) => stores.length)
  })

  it('owns credentials, location spacing, discovery, and persistence for US', async () => {
    const countryInfo = createCountryInfo(UsLocations.US, APIType.US)
    mocks.getMetaForApi.mockResolvedValue({
      token: 'token',
      clientId: 'client',
      countryInfos: [countryInfo]
    })

    const result = await refreshStoreCatalog({
      apiType: APIType.US,
      countryList: [UsLocations.US]
    })

    expect(mocks.getMetaForApi).toHaveBeenCalledWith(
      APIType.US,
      [UsLocations.US],
      true
    )
    expect(mocks.generateCoordinatesMesh).toHaveBeenCalledWith(
      countryInfo.locationLimits,
      30
    )
    expect(mocks.discoverFromLocation).toHaveBeenCalledWith(
      { latitude: 1, longitude: 2 },
      countryInfo,
      'token',
      'client'
    )
    expect(mocks.upsertMany).toHaveBeenCalledTimes(1)
    expect(result.storesPersisted).toBe(1)
  })

  it('owns the wider location spacing for EU discovery', async () => {
    const countryInfo = createCountryInfo(EuLocations.DE, APIType.EU)
    mocks.getMetaForApi.mockResolvedValue({
      token: 'token',
      clientId: 'client',
      countryInfos: [countryInfo]
    })

    await refreshStoreCatalog({ apiType: APIType.EU })

    expect(mocks.generateCoordinatesMesh).toHaveBeenCalledWith(
      countryInfo.locationLimits,
      50
    )
  })

  it('uses URL discovery without requesting credentials for EL', async () => {
    const countryInfo = createCountryInfo(ElLocations.AT, APIType.EL)
    mocks.getMetaForApi.mockResolvedValue({
      token: '',
      clientId: '',
      countryInfos: [countryInfo]
    })
    mocks.discoverFromUrl.mockResolvedValue([
      {
        id: 'AT-1',
        nationalStoreNumber: '1',
        name: 'Store',
        latitude: '1',
        longitude: '2',
        country: 'AT',
        hasMobileOrdering: true
      }
    ])

    const result = await refreshStoreCatalog({ apiType: APIType.EL })

    expect(mocks.getMetaForApi).toHaveBeenCalledWith(
      APIType.EL,
      undefined,
      false
    )
    expect(mocks.discoverFromUrl).toHaveBeenCalledWith(countryInfo)
    expect(mocks.generateCoordinatesMesh).not.toHaveBeenCalled()
    expect(result.storesPersisted).toBe(1)
  })

  it('rejects missing location-discovery credentials before network work', async () => {
    mocks.getMetaForApi.mockResolvedValue({
      token: '',
      clientId: 'client',
      countryInfos: []
    })

    await expect(
      refreshStoreCatalog({ apiType: APIType.US })
    ).rejects.toThrow('Bearer token is missing for US')
    expect(mocks.discoverFromLocation).not.toHaveBeenCalled()
    expect(mocks.upsertMany).not.toHaveBeenCalled()
  })

  it('rejects unsupported Store Catalog regions', async () => {
    await expect(
      refreshStoreCatalog({ apiType: APIType.HK })
    ).rejects.toThrow('Store Catalog refresh is not supported for HK')
    expect(mocks.getMetaForApi).not.toHaveBeenCalled()
  })
})
