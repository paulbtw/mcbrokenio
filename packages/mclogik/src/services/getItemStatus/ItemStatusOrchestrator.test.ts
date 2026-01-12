import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { type McdonaldsApiClient } from '../../clients'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type PosRepository } from '../../repositories'
import { APIType, IceType, type ICountryInfos, UsLocations } from '../../types'

import {
  createItemStatusOrchestrator,
  ItemStatusOrchestrator
} from './ItemStatusOrchestrator'

describe('ItemStatusOrchestrator', () => {
  const createMockPosRepository = (): PosRepository => ({
    findByCountries: vi.fn(),
    findAll: vi.fn(),
    updateManyStatus: vi.fn(),
    upsertMany: vi.fn()
  })

  const createMockApiClient = (): McdonaldsApiClient => ({
    apiType: APIType.US,
    fetchRestaurantOutages: vi.fn()
  })

  const createRateLimiter = (): RequestLimiter => ({
    maxRequestsPerSecond: 100,
    requestsPerLog: 10,
    concurrentRequests: 5
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

  const createCountryInfo = (country: string = 'US'): ICountryInfos => ({
    country: country === 'US' ? UsLocations.US : (country as UsLocations),
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

  describe('updateItemStatus', () => {
    it('should fetch stores, get status, and update database', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      const stores = [
        createMockPos({ id: 'store-1', country: 'US' }),
        createMockPos({ id: 'store-2', country: 'US' })
      ]

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue(stores)
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: ['SHAKE1'],
        success: true
      })
      vi.mocked(mockPosRepository.updateManyStatus).mockResolvedValue(2)

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      const result = await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')],
        token: 'test-token',
        clientId: 'test-client'
      })

      expect(result.storesChecked).toBe(2)
      expect(result.storesUpdated).toBe(2)
      expect(result.failures).toBe(0)
      expect(result.skipped).toBe(0)

      expect(mockPosRepository.findByCountries).toHaveBeenCalledWith(
        ['US'],
        expect.objectContaining({
          mobileOrderingOnly: true,
          limit: 2000,
          orderByOldestFirst: true
        })
      )
      expect(mockPosRepository.updateManyStatus).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'store-1',
            milkshakeStatus: 'PARTIAL_AVAILABLE'
          }),
          expect.objectContaining({
            id: 'store-2',
            milkshakeStatus: 'PARTIAL_AVAILABLE'
          })
        ])
      )
    })

    it('should return zeros when no stores found', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue([])

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      const result = await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')],
        token: 'test-token',
        clientId: 'test-client'
      })

      expect(result).toEqual({
        storesChecked: 0,
        storesUpdated: 0,
        failures: 0,
        skipped: 0
      })

      expect(mockPosRepository.updateManyStatus).not.toHaveBeenCalled()
    })

    it('should handle stores without matching country info as skipped', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      const stores = [
        createMockPos({ id: 'store-1', country: 'US' }),
        createMockPos({ id: 'store-2', country: 'CA' }) // No country info for CA
      ]

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue(stores)
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: [],
        success: true
      })
      vi.mocked(mockPosRepository.updateManyStatus).mockResolvedValue(1)

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      const result = await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')], // Only US
        token: 'test-token',
        clientId: 'test-client'
      })

      expect(result.storesChecked).toBe(2)
      expect(result.storesUpdated).toBe(1)
      expect(result.failures).toBe(0)
      expect(result.skipped).toBe(1) // CA store counted as skipped, not failure
    })

    it('should handle API errors gracefully', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      const stores = [
        createMockPos({ id: 'store-1', country: 'US' }),
        createMockPos({ id: 'store-2', country: 'US' })
      ]

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue(stores)
      vi.mocked(mockApiClient.fetchRestaurantOutages)
        .mockResolvedValueOnce({ outageProductCodes: [], success: true })
        .mockResolvedValueOnce({ outageProductCodes: [], success: false }) // API failure
      vi.mocked(mockPosRepository.updateManyStatus).mockResolvedValue(1)

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      const result = await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')],
        token: 'test-token',
        clientId: 'test-client'
      })

      expect(result.storesChecked).toBe(2)
      expect(result.storesUpdated).toBe(1)
      expect(result.failures).toBe(1) // One API failure
      expect(result.skipped).toBe(0)
    })

    it('should not call updateManyStatus when all stores are skipped', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      const stores = [createMockPos({ id: 'store-1', country: 'CA' })]

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue(stores)

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      const result = await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')], // No CA config
        token: 'test-token',
        clientId: 'test-client'
      })

      expect(result.storesChecked).toBe(1)
      expect(result.storesUpdated).toBe(0)
      expect(result.failures).toBe(0)
      expect(result.skipped).toBe(1)
      expect(mockPosRepository.updateManyStatus).not.toHaveBeenCalled()
    })

    it('should pass correct headers to API client', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockApiClient = createMockApiClient()
      const rateLimiter = createRateLimiter()

      const stores = [createMockPos({ id: 'store-1', country: 'US' })]

      vi.mocked(mockPosRepository.findByCountries).mockResolvedValue(stores)
      vi.mocked(mockApiClient.fetchRestaurantOutages).mockResolvedValue({
        outageProductCodes: [],
        success: true
      })
      vi.mocked(mockPosRepository.updateManyStatus).mockResolvedValue(1)

      const orchestrator = new ItemStatusOrchestrator({
        posRepository: mockPosRepository,
        apiClient: mockApiClient,
        rateLimiter
      })

      await orchestrator.updateItemStatus({
        countryInfos: [createCountryInfo('US')],
        token: 'my-bearer-token',
        clientId: 'my-client-id'
      })

      expect(mockApiClient.fetchRestaurantOutages).toHaveBeenCalledWith(
        '12345',
        expect.objectContaining({
          authorization: 'Bearer my-bearer-token',
          clientId: 'my-client-id',
          marketId: 'US'
        })
      )
    })
  })

  describe('createItemStatusOrchestrator', () => {
    it('should create an orchestrator instance', () => {
      const orchestrator = createItemStatusOrchestrator({
        posRepository: createMockPosRepository(),
        apiClient: createMockApiClient(),
        rateLimiter: createRateLimiter()
      })

      expect(orchestrator).toBeInstanceOf(ItemStatusOrchestrator)
    })
  })
})
