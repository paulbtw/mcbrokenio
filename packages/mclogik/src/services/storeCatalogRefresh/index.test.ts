import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  APIType,
  asCatalogScope,
  ElLocations,
  EuLocations,
  UsLocations
} from '../../types'

import { refreshStoreCatalog } from './index'

const mocks = vi.hoisted(() => ({
  getBearerToken: vi.fn(),
  getClientId: vi.fn(),
  generateCoordinatesMesh: vi.fn(),
  discoverFromLocation: vi.fn(),
  discoverFromUrl: vi.fn(),
  recordScopeRefresh: vi.fn()
}))

vi.mock('@mcbroken/db/client', () => ({ prisma: {} }))

vi.mock('../token/getBearerToken', () => ({
  getBearerToken: mocks.getBearerToken
}))

vi.mock('../token/getClientId', () => ({
  getClientId: mocks.getClientId
}))

vi.mock('../../utils/generateCoordinatesMesh', () => ({
  generateCoordinatesMesh: mocks.generateCoordinatesMesh
}))

vi.mock('../../repositories', () => ({
  createCatalogLifecycleRepository: () => ({
    recordScopeRefresh: mocks.recordScopeRefresh
  })
}))

vi.mock('../../clients/StoreDiscoveryClient', () => ({
  createStoreDiscoveryClient: () => ({
    discoverFromLocation: mocks.discoverFromLocation,
    discoverFromUrl: mocks.discoverFromUrl
  })
}))

describe('refreshStoreCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getBearerToken.mockResolvedValue('token')
    mocks.getClientId.mockReturnValue('client')
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
    mocks.recordScopeRefresh.mockImplementation(async ({ stores }) => ({
      storesPersisted: stores.length,
      scopeCompleted: true,
      cycleFinalized: false,
      reconciliationSkipped: false,
      storesMarkedMissing: 0,
      storesClosed: 0,
      storesPurged: 0
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('owns credentials, location spacing, discovery, and persistence for US', async () => {
    const result = await refreshStoreCatalog({
      apiType: APIType.US,
      catalogScopes: [asCatalogScope(UsLocations.US)]
    })

    expect(mocks.getBearerToken).toHaveBeenCalledWith(APIType.US)
    expect(mocks.getClientId).toHaveBeenCalledWith(APIType.US)
    expect(mocks.generateCoordinatesMesh).toHaveBeenCalledWith(
      expect.any(Object),
      30
    )
    expect(mocks.discoverFromLocation).toHaveBeenCalledWith(
      { latitude: 1, longitude: 2 },
      expect.objectContaining({
        country: UsLocations.US,
        catalogScope: UsLocations.US
      }),
      'token',
      'client'
    )
    expect(mocks.recordScopeRefresh).toHaveBeenCalledTimes(1)
    expect(result.storesPersisted).toBe(1)
  })

  it('owns the wider location spacing for EU discovery', async () => {
    await refreshStoreCatalog({
      apiType: APIType.EU,
      catalogScopes: [asCatalogScope(EuLocations.DE)]
    })

    expect(mocks.generateCoordinatesMesh).toHaveBeenCalledWith(
      expect.any(Object),
      50
    )
  })

  it('uses URL discovery without requesting credentials for EL', async () => {
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

    const result = await refreshStoreCatalog({
      apiType: APIType.EL,
      catalogScopes: [asCatalogScope(ElLocations.AT)]
    })

    expect(mocks.getBearerToken).not.toHaveBeenCalled()
    expect(mocks.getClientId).not.toHaveBeenCalled()
    expect(mocks.discoverFromUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        country: ElLocations.AT,
        catalogScope: ElLocations.AT
      })
    )
    expect(mocks.generateCoordinatesMesh).not.toHaveBeenCalled()
    expect(result.storesPersisted).toBe(1)
  })

  it('rejects missing location-discovery credentials before network work', async () => {
    mocks.getBearerToken.mockResolvedValue('')

    await expect(refreshStoreCatalog({ apiType: APIType.US })).rejects.toThrow(
      'Bearer token is missing for US'
    )
    expect(mocks.discoverFromLocation).not.toHaveBeenCalled()
    expect(mocks.recordScopeRefresh).not.toHaveBeenCalled()
  })

  it('rejects unsupported Store Catalog regions', async () => {
    await expect(refreshStoreCatalog({ apiType: APIType.HK })).rejects.toThrow(
      'Store Catalog refresh is not supported for HK'
    )
    expect(mocks.getBearerToken).not.toHaveBeenCalled()
  })

  it('logs only allowlisted Axios failure fields', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mocks.getBearerToken.mockResolvedValue('bearer-secret')
    mocks.getClientId.mockReturnValue('client-secret')
    mocks.discoverFromLocation.mockRejectedValue(
      Object.assign(
        new Error('Request to https://example.com?key=url-secret failed'),
        {
          name: 'AxiosError',
          isAxiosError: true,
          code: 'ERR_BAD_RESPONSE',
          config: {
            headers: {
              authorization: 'Bearer bearer-secret',
              'mcd-clientid': 'client-secret'
            },
            url: 'https://example.com?key=url-secret'
          },
          response: { status: 503 }
        }
      )
    )

    await expect(
      refreshStoreCatalog({
        apiType: APIType.US,
        catalogScopes: [asCatalogScope(UsLocations.US)]
      })
    ).rejects.toThrow('All store discovery requests failed')

    expect(consoleError).toHaveBeenCalledWith(
      'Store Catalog discovery request failed',
      { apiType: APIType.US, market: UsLocations.US },
      {
        kind: 'http',
        retryable: true,
        code: 'ERR_BAD_RESPONSE',
        status: 503,
        message: 'Upstream HTTP request failed'
      }
    )
    const serializedLog = JSON.stringify(consoleError.mock.calls)
    expect(serializedLog).not.toContain('bearer-secret')
    expect(serializedLog).not.toContain('client-secret')
    expect(serializedLog).not.toContain('url-secret')
  })
})
