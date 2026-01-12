import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { APIType, IceType, type ICountryInfos, UsLocations } from '../types'

import {
  calculateStoreItemStatus,
  checkProductAvailability,
  createItemStatusService,
  ItemStatusService,
  NOT_APPLICABLE_MARKER
} from './ItemStatusService'
import { type McdonaldsApiClient } from './McdonaldsApiClient'

describe('checkProductAvailability', () => {
  describe('when no product codes are defined', () => {
    it('should return UNAVAILABLE status with count 0', () => {
      const result = checkProductAvailability(['CODE1', 'CODE2'], [])

      expect(result).toEqual({
        status: 'UNAVAILABLE',
        count: 0,
        unavailable: 0
      })
    })
  })

  describe('when product codes include NOT_APPLICABLE_MARKER', () => {
    it('should return NOT_APPLICABLE status', () => {
      const result = checkProductAvailability(
        ['CODE1', 'CODE2'],
        [NOT_APPLICABLE_MARKER, 'CODE3']
      )

      expect(result).toEqual({
        status: 'NOT_APPLICABLE',
        count: 2,
        unavailable: 0
      })
    })
  })

  describe('when all products are available', () => {
    it('should return AVAILABLE status with 0 unavailable', () => {
      const result = checkProductAvailability(
        ['OUTAGE1', 'OUTAGE2'],
        ['PROD1', 'PROD2', 'PROD3']
      )

      expect(result).toEqual({
        status: 'AVAILABLE',
        count: 3,
        unavailable: 0
      })
    })

    it('should return AVAILABLE when outage list is empty', () => {
      const result = checkProductAvailability([], ['PROD1', 'PROD2'])

      expect(result).toEqual({
        status: 'AVAILABLE',
        count: 2,
        unavailable: 0
      })
    })
  })

  describe('when some products are unavailable', () => {
    it('should return PARTIAL_AVAILABLE status', () => {
      const result = checkProductAvailability(
        ['PROD1', 'PROD3'],
        ['PROD1', 'PROD2', 'PROD3']
      )

      expect(result).toEqual({
        status: 'PARTIAL_AVAILABLE',
        count: 3,
        unavailable: 2
      })
    })

    it('should count single unavailable product correctly', () => {
      const result = checkProductAvailability(
        ['PROD2'],
        ['PROD1', 'PROD2', 'PROD3']
      )

      expect(result).toEqual({
        status: 'PARTIAL_AVAILABLE',
        count: 3,
        unavailable: 1
      })
    })
  })

  describe('when all products are unavailable', () => {
    it('should return UNAVAILABLE status', () => {
      const result = checkProductAvailability(
        ['PROD1', 'PROD2', 'PROD3'],
        ['PROD1', 'PROD2', 'PROD3']
      )

      expect(result).toEqual({
        status: 'UNAVAILABLE',
        count: 3,
        unavailable: 3
      })
    })

    it('should return UNAVAILABLE for single product that is in outage', () => {
      const result = checkProductAvailability(['PROD1'], ['PROD1'])

      expect(result).toEqual({
        status: 'UNAVAILABLE',
        count: 1,
        unavailable: 1
      })
    })
  })
})

describe('calculateStoreItemStatus', () => {
  const createCountryInfo = (
    overrides: Partial<ICountryInfos> = {}
  ): ICountryInfos => ({
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://example.com'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['SHAKE1', 'SHAKE2'],
      [IceType.MCFLURRY]: ['FLURRY1', 'FLURRY2'],
      [IceType.MCSUNDAE]: ['SUNDAE1']
    },
    ...overrides
  })

  it('should calculate status for all product categories', () => {
    const countryInfo = createCountryInfo()
    const outageProductCodes = ['SHAKE1', 'FLURRY1', 'FLURRY2']

    const result = calculateStoreItemStatus(outageProductCodes, countryInfo)

    expect(result.milkshake).toEqual({
      status: 'PARTIAL_AVAILABLE',
      count: 2,
      unavailable: 1
    })
    expect(result.mcFlurry).toEqual({
      status: 'UNAVAILABLE',
      count: 2,
      unavailable: 2
    })
    expect(result.mcSundae).toEqual({
      status: 'AVAILABLE',
      count: 1,
      unavailable: 0
    })
  })

  it('should return all AVAILABLE when no outages', () => {
    const countryInfo = createCountryInfo()
    const outageProductCodes: string[] = []

    const result = calculateStoreItemStatus(outageProductCodes, countryInfo)

    expect(result.milkshake.status).toBe('AVAILABLE')
    expect(result.mcFlurry.status).toBe('AVAILABLE')
    expect(result.mcSundae.status).toBe('AVAILABLE')
  })

  it('should handle custom items', () => {
    const countryInfo = createCountryInfo({
      customItems: {
        'Apple Pie': ['PIE1', 'PIE2'],
        'McRib': ['RIB1']
      }
    })
    const outageProductCodes = ['PIE1']

    const result = calculateStoreItemStatus(outageProductCodes, countryInfo)

    expect(result.custom).toHaveLength(2)
    expect(result.custom).toContainEqual({
      name: 'Apple Pie',
      status: 'PARTIAL_AVAILABLE',
      count: 2,
      unavailable: 1
    })
    expect(result.custom).toContainEqual({
      name: 'McRib',
      status: 'AVAILABLE',
      count: 1,
      unavailable: 0
    })
  })

  it('should handle empty custom items', () => {
    const countryInfo = createCountryInfo({
      customItems: undefined
    })
    const outageProductCodes: string[] = []

    const result = calculateStoreItemStatus(outageProductCodes, countryInfo)

    expect(result.custom).toEqual([])
  })
})

describe('ItemStatusService', () => {
  const createMockApiClient = (): McdonaldsApiClient => ({
    apiType: APIType.US,
    fetchRestaurantOutages: vi.fn()
  })

  const createMockPos = (overrides: Partial<Pos> = {}): Pos => ({
    id: 'store-123',
    nationalStoreNumber: '12345',
    name: 'Test Store',
    latitude: '40.7128',
    longitude: '-74.0060',
    country: 'US',
    hasMobileOrdering: true,
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })

  const createCountryInfo = (): ICountryInfos => ({
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://example.com'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['SHAKE1', 'SHAKE2'],
      [IceType.MCFLURRY]: ['FLURRY1'],
      [IceType.MCSUNDAE]: ['SUNDAE1']
    }
  })

  describe('getStoreItemStatus', () => {
    it('should fetch outages and calculate status', async () => {
      const mockApiClient = createMockApiClient()
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: ['SHAKE1', 'FLURRY1'],
        success: true
      })

      const service = new ItemStatusService(mockApiClient)
      const pos = createMockPos()
      const countryInfo = createCountryInfo()

      const result = await service.getStoreItemStatus(
        pos,
        countryInfo,
        'test-token',
        'test-client-id'
      )

      expect(mockApiClient.fetchRestaurantOutages).toHaveBeenCalledWith(
        '12345',
        {
          authorization: 'Bearer test-token',
          clientId: 'test-client-id',
          marketId: 'US'
        }
      )

      expect(result).not.toBeNull()
      expect(result!.milkshake.status).toBe('PARTIAL_AVAILABLE')
      expect(result!.mcFlurry.status).toBe('UNAVAILABLE')
      expect(result!.mcSundae.status).toBe('AVAILABLE')
    })

    it('should return all available when no outages', async () => {
      const mockApiClient = createMockApiClient()
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: [],
        success: true
      })

      const service = new ItemStatusService(mockApiClient)
      const pos = createMockPos()
      const countryInfo = createCountryInfo()

      const result = await service.getStoreItemStatus(
        pos,
        countryInfo,
        'test-token',
        'test-client-id'
      )

      expect(result!.milkshake.status).toBe('AVAILABLE')
      expect(result!.mcFlurry.status).toBe('AVAILABLE')
      expect(result!.mcSundae.status).toBe('AVAILABLE')
    })

    it('should return null when API call fails', async () => {
      const mockApiClient = createMockApiClient()
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: [],
        success: false
      })

      const service = new ItemStatusService(mockApiClient)
      const pos = createMockPos()
      const countryInfo = createCountryInfo()

      const result = await service.getStoreItemStatus(
        pos,
        countryInfo,
        'test-token',
        'test-client-id'
      )

      expect(result).toBeNull()
    })
  })

  describe('createItemStatusService', () => {
    it('should create an ItemStatusService instance', () => {
      const mockApiClient = createMockApiClient()
      const service = createItemStatusService(mockApiClient)

      expect(service).toBeInstanceOf(ItemStatusService)
    })
  })
})
