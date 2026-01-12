import { type AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { APIType } from '../types'

import {
  API_CLIENT_CONFIGS,
  createAllApiClients,
  createApiClient,
  ElApiClient,
  type McdonaldsRequestHeaders,
  StandardApiClient
} from './McdonaldsApiClient'

describe('StandardApiClient', () => {
  const createMockHttpClient = (): AxiosInstance =>
    ({
      get: vi.fn()
    }) as unknown as AxiosInstance

  const createHeaders = (): McdonaldsRequestHeaders => ({
    authorization: 'Bearer test-token',
    clientId: 'test-client-id',
    marketId: 'US'
  })

  describe('fetchRestaurantOutages', () => {
    it('should fetch outages and return product codes', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          response: {
            restaurant: {
              catalog: {
                outageProductCodes: ['CODE1', 'CODE2', 'CODE3']
              }
            }
          }
        }
      })

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.US,
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual(['CODE1', 'CODE2', 'CODE3'])
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://us-prod.api.mcd.com/exp/v1/restaurant/12345?filter=full&storeUniqueIdType=NatlStrNumber',
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: 'Bearer test-token',
            'mcd-clientId': 'test-client-id',
            'mcd-sourceapp': 'GMA',
            'mcd-marketid': 'US',
            'accept-language': 'en-US'
          })
        })
      )
    })

    it('should return empty array when response has no outage codes', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          response: {
            restaurant: {
              catalog: {}
            }
          }
        }
      })

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.US,
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual([])
    })

    it('should return empty array when response structure is missing', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {}
      })

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.US,
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual([])
    })

    it('should return empty array on API error', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Network error'))

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.US,
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual([])
    })

    it('should use correct config for EU region', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: { response: { restaurant: { catalog: { outageProductCodes: [] } } } }
      })

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.EU,
        mockHttpClient
      )
      await client.fetchRestaurantOutages('12345', createHeaders())

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('eu-prod.api.mcd.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'accept-language': 'en-GB'
          })
        })
      )
    })

    it('should use correct config for AP region', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: { response: { restaurant: { catalog: { outageProductCodes: [] } } } }
      })

      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.AP,
        mockHttpClient
      )
      await client.fetchRestaurantOutages('12345', createHeaders())

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('ap-prod.api.mcd.com'),
        expect.anything()
      )
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('storeUniqueIdType=NSN'),
        expect.anything()
      )
    })
  })

  describe('apiType', () => {
    it('should return the correct API type', () => {
      const mockHttpClient = createMockHttpClient()
      const client = new StandardApiClient(
        API_CLIENT_CONFIGS.US,
        mockHttpClient
      )

      expect(client.apiType).toBe('US')
    })
  })
})

describe('ElApiClient', () => {
  const createMockHttpClient = (): AxiosInstance =>
    ({
      get: vi.fn()
    }) as unknown as AxiosInstance

  const createHeaders = (): McdonaldsRequestHeaders => ({
    authorization: 'Bearer test-token',
    clientId: 'test-client-id',
    marketId: 'FR'
  })

  describe('fetchRestaurantOutages', () => {
    it('should fetch outages and convert numeric codes to strings', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {
          productOutages: {
            productIDs: [123, 456, 789]
          }
        }
      })

      const client = new ElApiClient(
        'https://el-prod.api.mcd.com',
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual(['123', '456', '789'])
    })

    it('should use correct endpoint format', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: { productOutages: { productIDs: [] } }
      })

      const client = new ElApiClient(
        'https://el-prod.api.mcd.com',
        mockHttpClient
      )
      await client.fetchRestaurantOutages('12345', createHeaders())

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://el-prod.api.mcd.com/exp/v1/menu/gmal/restaurants/12345/status',
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: 'Bearer test-token',
            'mcd-clientid': 'test-client-id',
            'mcd-sourceapp': 'GMAL'
          })
        })
      )
    })

    it('should return empty array when productOutages is missing', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        data: {}
      })

      const client = new ElApiClient(
        'https://el-prod.api.mcd.com',
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual([])
    })

    it('should return empty array on API error', async () => {
      const mockHttpClient = createMockHttpClient()
      vi.mocked(mockHttpClient.get).mockRejectedValue(new Error('Network error'))

      const client = new ElApiClient(
        'https://el-prod.api.mcd.com',
        mockHttpClient
      )
      const result = await client.fetchRestaurantOutages('12345', createHeaders())

      expect(result.outageProductCodes).toEqual([])
    })
  })

  describe('apiType', () => {
    it('should return EL', () => {
      const client = new ElApiClient()

      expect(client.apiType).toBe('EL')
    })
  })
})

describe('createApiClient', () => {
  it('should create StandardApiClient for US', () => {
    const client = createApiClient(APIType.US)

    expect(client).toBeInstanceOf(StandardApiClient)
    expect(client.apiType).toBe('US')
  })

  it('should create StandardApiClient for EU', () => {
    const client = createApiClient(APIType.EU)

    expect(client).toBeInstanceOf(StandardApiClient)
    expect(client.apiType).toBe('EU')
  })

  it('should create StandardApiClient for AP', () => {
    const client = createApiClient(APIType.AP)

    expect(client).toBeInstanceOf(StandardApiClient)
    expect(client.apiType).toBe('AP')
  })

  it('should create ElApiClient for EL', () => {
    const client = createApiClient(APIType.EL)

    expect(client).toBeInstanceOf(ElApiClient)
    expect(client.apiType).toBe('EL')
  })

  it('should throw for unsupported API type', () => {
    expect(() => createApiClient(APIType.HK)).toThrow('Unsupported API type: HK')
    expect(() => createApiClient(APIType.UNKNOWN)).toThrow(
      'Unsupported API type: UNKNOWN'
    )
  })

  it('should accept custom http client', () => {
    const mockHttpClient = { get: vi.fn() } as unknown as AxiosInstance
    const client = createApiClient(APIType.US, mockHttpClient)

    expect(client).toBeInstanceOf(StandardApiClient)
  })
})

describe('createAllApiClients', () => {
  it('should create clients for all supported regions', () => {
    const clients = createAllApiClients()

    expect(clients.size).toBe(4)
    expect(clients.has('EU' as APIType)).toBe(true)
    expect(clients.has('US' as APIType)).toBe(true)
    expect(clients.has('AP' as APIType)).toBe(true)
    expect(clients.has('EL' as APIType)).toBe(true)
  })

  it('should create correct client types', () => {
    const clients = createAllApiClients()

    expect(clients.get('EU' as APIType)).toBeInstanceOf(StandardApiClient)
    expect(clients.get('US' as APIType)).toBeInstanceOf(StandardApiClient)
    expect(clients.get('AP' as APIType)).toBeInstanceOf(StandardApiClient)
    expect(clients.get('EL' as APIType)).toBeInstanceOf(ElApiClient)
  })
})

describe('API_CLIENT_CONFIGS', () => {
  it('should have configs for EU, US, AP, EL', () => {
    expect(API_CLIENT_CONFIGS.EU).toBeDefined()
    expect(API_CLIENT_CONFIGS.US).toBeDefined()
    expect(API_CLIENT_CONFIGS.AP).toBeDefined()
    expect(API_CLIENT_CONFIGS.EL).toBeDefined()
  })

  it('should have correct base URLs', () => {
    expect(API_CLIENT_CONFIGS.EU.baseUrl).toBe('https://eu-prod.api.mcd.com')
    expect(API_CLIENT_CONFIGS.US.baseUrl).toBe('https://us-prod.api.mcd.com')
    expect(API_CLIENT_CONFIGS.AP.baseUrl).toBe('https://ap-prod.api.mcd.com')
    expect(API_CLIENT_CONFIGS.EL.baseUrl).toBe('https://el-prod.api.mcd.com')
  })
})
