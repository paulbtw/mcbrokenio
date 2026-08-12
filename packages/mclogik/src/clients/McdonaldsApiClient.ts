import axios, { type AxiosInstance } from 'axios'

import { type APIType } from '../types'

import {
  getUpstreamRecord,
  requireUpstreamNumberArray,
  requireUpstreamStringArray
} from './upstreamResponse'

/**
 * Response from the McDonald's API containing outage information
 */
export interface OutageResponse {
  /** Product codes that are currently unavailable */
  outageProductCodes: string[]
}

/**
 * Request headers for McDonald's API calls
 */
export interface McdonaldsRequestHeaders {
  authorization: string
  clientId: string
  marketId: string
}

/**
 * Interface for McDonald's API client implementations
 * Each region may have a different API endpoint and response format,
 * but they all return outage product codes in a normalized format
 */
export interface McdonaldsApiClient {
  /**
   * Fetch the outage status for a specific restaurant
   * @param storeNumber The national store number
   * @param headers Authentication and market headers
   * @returns Normalized outage response with product codes
   */
  fetchRestaurantOutages(
    storeNumber: string,
    headers: McdonaldsRequestHeaders
  ): Promise<OutageResponse>

  /**
   * The API type this client handles
   */
  readonly apiType: APIType
}

/**
 * Base configuration for API clients
 */
export interface ApiClientConfig {
  /** Base URL for the API */
  baseUrl: string
  /** API type identifier */
  apiType: APIType
  /** Source app header value */
  sourceApp: string
  /** Accept language header value */
  acceptLanguage?: string
  /** Store ID type parameter */
  storeIdType: string
}

/**
 * API client for EU, US, and AU regions
 * These all use the same response format
 */
export class StandardApiClient implements McdonaldsApiClient {
  readonly apiType: APIType

  constructor(
    private readonly config: ApiClientConfig,
    private readonly httpClient: AxiosInstance = axios
  ) {
    this.apiType = config.apiType
  }

  async fetchRestaurantOutages(
    storeNumber: string,
    headers: McdonaldsRequestHeaders
  ): Promise<OutageResponse> {
    const url = `${this.config.baseUrl}/exp/v1/restaurant/${storeNumber}?filter=full&storeUniqueIdType=${this.config.storeIdType}`

    const { data } = await this.httpClient.get<unknown>(url, {
      headers: {
        authorization: headers.authorization,
        'mcd-clientId': headers.clientId,
        'mcd-sourceapp': this.config.sourceApp,
        'mcd-marketid': headers.marketId,
        'mcd-uuid': '"',
        ...(this.config.acceptLanguage && {
          'accept-language': this.config.acceptLanguage
        })
      }
    })

    const response = getUpstreamRecord(getUpstreamRecord(data)?.response)
    const restaurant = getUpstreamRecord(response?.restaurant)
    const catalog = getUpstreamRecord(restaurant?.catalog)
    const outageProductCodes = requireUpstreamStringArray(
      catalog?.outageProductCodes
    )

    return { outageProductCodes }
  }
}

/**
 * API client for EL (Europe/Latin) region
 * Uses a different endpoint and response format
 */
export class ElApiClient implements McdonaldsApiClient {
  readonly apiType = 'EL' as APIType

  constructor(
    private readonly baseUrl: string = 'https://el-prod.api.mcd.com',
    private readonly httpClient: AxiosInstance = axios
  ) {}

  async fetchRestaurantOutages(
    storeNumber: string,
    headers: McdonaldsRequestHeaders
  ): Promise<OutageResponse> {
    const url = `${this.baseUrl}/exp/v1/menu/gmal/restaurants/${storeNumber}/status`

    const { data } = await this.httpClient.get<unknown>(url, {
      headers: {
        authorization: headers.authorization,
        'mcd-clientid': headers.clientId,
        'mcd-sourceapp': 'GMAL'
      }
    })

    // EL responses use numbers; normalize to product-code strings.
    const productOutages = getUpstreamRecord(
      getUpstreamRecord(data)?.productOutages
    )
    const outageProductCodes = requireUpstreamNumberArray(
      productOutages?.productIDs
    ).map((code) => code.toString())

    return { outageProductCodes }
  }
}

/**
 * Pre-configured API client configurations for each region
 */
export const API_CLIENT_CONFIGS: Record<
  Exclude<APIType, 'HK' | 'UNKNOWN'>,
  ApiClientConfig
> = {
  EU: {
    baseUrl: 'https://eu-prod.api.mcd.com',
    apiType: 'EU' as APIType,
    sourceApp: 'GMA',
    acceptLanguage: 'en-GB',
    storeIdType: 'gblNumber'
  },
  US: {
    baseUrl: 'https://us-prod.api.mcd.com',
    apiType: 'US' as APIType,
    sourceApp: 'GMA',
    acceptLanguage: 'en-US',
    storeIdType: 'NatlStrNumber'
  },
  AP: {
    baseUrl: 'https://ap-prod.api.mcd.com',
    apiType: 'AP' as APIType,
    sourceApp: 'GMA',
    acceptLanguage: 'en-AU',
    storeIdType: 'NSN'
  },
  EL: {
    baseUrl: 'https://el-prod.api.mcd.com',
    apiType: 'EL' as APIType,
    sourceApp: 'GMAL',
    storeIdType: 'NatlStrNumber'
  }
}

/**
 * Factory function to create the appropriate API client for a region
 */
export function createApiClient(
  apiType: APIType,
  httpClient?: AxiosInstance
): McdonaldsApiClient {
  if (apiType === 'EL') {
    return new ElApiClient(API_CLIENT_CONFIGS.EL.baseUrl, httpClient)
  }

  const config = API_CLIENT_CONFIGS[apiType as keyof typeof API_CLIENT_CONFIGS]
  if (!config) {
    throw new Error(`Unsupported API type: ${apiType}`)
  }

  return new StandardApiClient(config, httpClient)
}

/**
 * Create all API clients for all supported regions
 */
export function createAllApiClients(
  httpClient?: AxiosInstance
): Map<APIType, McdonaldsApiClient> {
  const clients = new Map<APIType, McdonaldsApiClient>()

  for (const apiType of ['EU', 'US', 'AP', 'EL'] as APIType[]) {
    clients.set(apiType, createApiClient(apiType, httpClient))
  }

  return clients
}
