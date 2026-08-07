import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { type RequestLimiter } from '../../constants/RateLimit'
import {
  APIType,
  IceType,
  type ICountryInfos,
  type Locations,
  UsLocations
} from '../../types'

import {
  type AvailabilityPollingDependencies,
  AvailabilityPollingModule
} from './AvailabilityPollingModule'

const TEST_LIMITER: RequestLimiter = {
  maxRequestsPerSecond: 100,
  requestsPerLog: 100,
  concurrentRequests: 5
}

function createStore(overrides: Partial<Pos> = {}): Pos {
  return {
    id: 'US-12345',
    nationalStoreNumber: '12345',
    name: 'Test Store',
    latitude: '40.7128',
    longitude: '-74.0060',
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
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

function createCountryInfo(country: Locations = UsLocations.US): ICountryInfos {
  return {
    country,
    getStores: {
      api: APIType.US,
      url: 'https://example.com'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['SHAKE1', 'SHAKE2'],
      [IceType.MCFLURRY]: ['FLURRY1'],
      [IceType.MCSUNDAE]: ['SUNDAE1']
    }
  }
}

function createProductAvailability() {
  return {
    milkshake: {
      status: 'PARTIAL_AVAILABLE' as const,
      count: 2,
      unavailable: 1
    },
    mcFlurry: {
      status: 'AVAILABLE' as const,
      count: 1,
      unavailable: 0
    },
    mcSundae: {
      status: 'UNAVAILABLE' as const,
      count: 1,
      unavailable: 1
    },
    custom: [
      {
        name: 'Apple Pie',
        status: 'AVAILABLE' as const,
        count: 1,
        unavailable: 0
      }
    ]
  }
}

function createDependencies(
  options: {
    stores?: Pos[]
    countryInfos?: ICountryInfos[]
  } = {}
) {
  const fetchStoreProductAvailability = vi
    .fn()
    .mockResolvedValue(createProductAvailability())

  const dependencies: AvailabilityPollingDependencies = {
    loadPollContext: vi.fn().mockResolvedValue({
      token: 'test-token',
      clientId: 'test-client',
      countryInfos: options.countryInfos ?? [createCountryInfo()]
    }),
    findEligibleStores: vi
      .fn()
      .mockResolvedValue(options.stores ?? [createStore()]),
    createProductAvailabilityAdapter: vi.fn().mockReturnValue({
      fetchStoreProductAvailability
    }),
    persistUpdates: vi.fn().mockResolvedValue(undefined),
    getRequestLimiter: vi.fn().mockReturnValue(TEST_LIMITER),
    addBreadcrumb: vi.fn(),
    captureBatchSummary: vi.fn(),
    logStoreFailure: vi.fn(),
    now: vi.fn().mockReturnValueOnce(1_000).mockReturnValue(1_250)
  }

  return {
    dependencies,
    fetchStoreProductAvailability
  }
}

describe('AvailabilityPollingModule', () => {
  it('polls eligible stores and atomically persists successful availability', async () => {
    const stores = [
      createStore({ id: 'US-1', nationalStoreNumber: '1', errorCounter: 2 }),
      createStore({ id: 'US-2', nationalStoreNumber: '2', errorCounter: 1 })
    ]
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({
      apiType: APIType.US,
      countryList: [UsLocations.US]
    })

    expect(dependencies.loadPollContext).toHaveBeenCalledWith(APIType.US, [
      UsLocations.US
    ])
    expect(dependencies.findEligibleStores).toHaveBeenCalledWith(['US'])
    expect(dependencies.createProductAvailabilityAdapter).toHaveBeenCalledWith(
      APIType.US
    )
    expect(fetchStoreProductAvailability).toHaveBeenCalledTimes(2)
    expect(dependencies.persistUpdates).toHaveBeenCalledTimes(1)
    expect(dependencies.persistUpdates).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'US-1',
          milkshakeStatus: 'PARTIAL_AVAILABLE',
          mcSundaeStatus: 'UNAVAILABLE',
          errorCounter: 0,
          isResponsive: true
        }),
        expect.objectContaining({
          id: 'US-2',
          errorCounter: 0,
          isResponsive: true
        })
      ])
    )
    expect(result).toEqual({
      totalStores: 2,
      successCount: 2,
      failedCount: 0,
      skippedCount: 0,
      countryBreakdown: {
        US: { total: 2, success: 2, failed: 0, skipped: 0 }
      },
      durationMs: 250
    })
    expect(dependencies.captureBatchSummary).toHaveBeenCalledWith({
      apiType: APIType.US,
      totalStores: 2,
      successCount: 2,
      failedCount: 0,
      countryBreakdown: {
        US: { total: 2, failed: 0 }
      },
      durationMs: 250,
      sampleErrors: []
    })
  })

  it('records store failures, updates health, and continues the poll', async () => {
    const stores = [
      createStore({ id: 'US-fail', errorCounter: 2 }),
      createStore({ id: 'US-ok', nationalStoreNumber: '67890' })
    ]
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })
    const axiosError = Object.assign(
      new Error('Request failed with status code 400'),
      {
        name: 'AxiosError',
        isAxiosError: true,
        config: { url: 'https://example.com/stores/12345' },
        response: {
          status: 400,
          data: {
            status: {
              code: 40000,
              type: 'ValidationException',
              message: 'Invalid store',
              service: 'Restaurant',
              errors: [
                {
                  code: 40041,
                  type: 'InvalidStoreException',
                  message: 'Invalid store',
                  property: 'Request',
                  service: 'restaurant-search'
                }
              ]
            }
          }
        }
      }
    )

    fetchStoreProductAvailability
      .mockRejectedValueOnce(axiosError)
      .mockResolvedValueOnce(createProductAvailability())

    const module = new AvailabilityPollingModule(dependencies)
    const result = await module.poll({ apiType: APIType.US })

    expect(result.failedCount).toBe(1)
    expect(result.successCount).toBe(1)
    expect(result.countryBreakdown.US).toEqual({
      total: 2,
      success: 1,
      failed: 1,
      skipped: 0
    })
    expect(dependencies.persistUpdates).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'US-fail',
          errorCounter: 3,
          isResponsive: false
        }),
        expect.objectContaining({
          id: 'US-ok',
          errorCounter: 0,
          isResponsive: true
        })
      ])
    )
    expect(dependencies.captureBatchSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        failedCount: 1,
        sampleErrors: [
          expect.objectContaining({
            storeId: 'US-fail',
            requestUrl: 'https://example.com/stores/12345',
            httpStatus: 400,
            responseCode: '40000',
            responseType: 'ValidationException',
            responseMessage: 'Invalid store',
            responseService: 'Restaurant',
            responseErrors: [
              expect.objectContaining({
                code: '40041',
                service: 'restaurant-search'
              })
            ]
          })
        ]
      })
    )
  })

  it('caps telemetry samples at five unique failure signatures', async () => {
    const stores = Array.from({ length: 7 }, (_, index) =>
      createStore({
        id: `US-${index}`,
        nationalStoreNumber: String(index)
      })
    )
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })

    fetchStoreProductAvailability.mockImplementation(async (store: Pos) => {
      throw Object.assign(new Error(`Failure ${store.id}`), {
        name: 'AxiosError',
        isAxiosError: true,
        response: { status: 400 + Number(store.nationalStoreNumber) }
      })
    })

    const module = new AvailabilityPollingModule(dependencies)
    await module.poll({ apiType: APIType.US })

    expect(dependencies.captureBatchSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        sampleErrors: expect.any(Array)
      })
    )
    const summary = vi.mocked(dependencies.captureBatchSummary).mock
      .calls[0]?.[0]
    expect(summary?.sampleErrors).toHaveLength(5)
    expect(dependencies.logStoreFailure).toHaveBeenCalledTimes(5)
  })

  it('groups repeated failures under one diagnostic signature', async () => {
    const stores = [
      createStore({ id: 'US-1', nationalStoreNumber: '1' }),
      createStore({ id: 'US-2', nationalStoreNumber: '2' })
    ]
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })
    fetchStoreProductAvailability.mockRejectedValue(
      new Error('Network offline')
    )
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({ apiType: APIType.US })

    expect(result.failedCount).toBe(2)
    const summary = vi.mocked(dependencies.captureBatchSummary).mock
      .calls[0]?.[0]
    expect(summary?.sampleErrors).toHaveLength(1)
    expect(dependencies.logStoreFailure).toHaveBeenCalledTimes(1)
  })

  it('treats null responses and unknown thrown values as store failures', async () => {
    const stores = [
      createStore({ id: 'US-null', nationalStoreNumber: '1' }),
      createStore({ id: 'US-unknown', nationalStoreNumber: '2' })
    ]
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })
    fetchStoreProductAvailability
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce('offline')
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({ apiType: APIType.US })

    expect(result.failedCount).toBe(2)
    expect(dependencies.captureBatchSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        sampleErrors: expect.arrayContaining([
          expect.objectContaining({
            errorName: 'Error',
            errorMessage: 'Product availability request returned null'
          }),
          expect.objectContaining({
            errorName: 'UnknownError',
            errorMessage: 'Product availability request failed'
          })
        ])
      })
    )
  })

  it('counts stores without market configuration as skipped', async () => {
    const stores = [
      createStore({ id: 'US-1' }),
      createStore({ id: 'CA-1', country: 'CA' })
    ]
    const { dependencies, fetchStoreProductAvailability } = createDependencies({
      stores
    })
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({ apiType: APIType.US })

    expect(result).toMatchObject({
      totalStores: 2,
      successCount: 1,
      failedCount: 0,
      skippedCount: 1
    })
    expect(result.countryBreakdown.CA).toEqual({
      total: 1,
      success: 0,
      failed: 0,
      skipped: 1
    })
    expect(fetchStoreProductAvailability).toHaveBeenCalledTimes(1)
    expect(dependencies.persistUpdates).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'US-1' })
    ])
  })

  it('returns an empty summary without persistence or telemetry when no stores are eligible', async () => {
    const { dependencies } = createDependencies({ stores: [] })
    const module = new AvailabilityPollingModule(dependencies)

    const result = await module.poll({ apiType: APIType.US })

    expect(result).toEqual({
      totalStores: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      countryBreakdown: {},
      durationMs: 250
    })
    expect(dependencies.persistUpdates).not.toHaveBeenCalled()
    expect(dependencies.captureBatchSummary).not.toHaveBeenCalled()
  })

  it('rejects setup failures so the Lambda invocation can retry', async () => {
    const { dependencies } = createDependencies()
    vi.mocked(dependencies.loadPollContext).mockRejectedValue(
      new Error('Credential lookup failed')
    )
    const module = new AvailabilityPollingModule(dependencies)

    await expect(module.poll({ apiType: APIType.US })).rejects.toThrow(
      'Credential lookup failed'
    )
    expect(dependencies.findEligibleStores).not.toHaveBeenCalled()
    expect(dependencies.persistUpdates).not.toHaveBeenCalled()
  })

  it('rejects atomic persistence failures before emitting a completed summary', async () => {
    const { dependencies } = createDependencies()
    vi.mocked(dependencies.persistUpdates).mockRejectedValue(
      new Error('Transaction failed')
    )
    const module = new AvailabilityPollingModule(dependencies)

    await expect(module.poll({ apiType: APIType.US })).rejects.toThrow(
      'Transaction failed'
    )
    expect(dependencies.captureBatchSummary).not.toHaveBeenCalled()
  })
})
