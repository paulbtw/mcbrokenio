import { ItemStatus } from '@mcbroken/db'

import {
  type ICountryInfos,
  type MarketCode,
  type ProductCodeConfig
} from '../types'
import { normalizeProductCodeConfig } from '../utils/productCodeConfig'

import {
  type McdonaldsApiClient,
  type McdonaldsRequestHeaders
} from './McdonaldsApiClient'

/**
 * Availability result for a single product category.
 */
export interface ProductAvailability {
  status: ItemStatus
  count: number
  unavailable: number
  name?: string
}

/**
 * Complete product availability for a store.
 */
export interface StoreProductAvailability {
  milkshake: ProductAvailability
  mcFlurry: ProductAvailability
  mcSundae: ProductAvailability
  custom: ProductAvailability[]
}

export interface ProductAvailabilityStore {
  nationalStoreNumber: string
  market: MarketCode
}

/**
 * Pure function to check product availability based on outage codes
 * This is the core business logic extracted from the handlers
 *
 * @param outageProductCodes - List of product codes currently unavailable
 * @param productCodes - List of product codes to check for this category
 * @returns Availability status for the product category
 */
export function checkProductAvailability(
  outageProductCodes: string[],
  productCodes: ProductCodeConfig
): Omit<ProductAvailability, 'name'> {
  const normalizedProductCodes = normalizeProductCodeConfig(productCodes)

  if (normalizedProductCodes.kind === 'unavailable') {
    return {
      status: ItemStatus.NOT_APPLICABLE,
      count: 0,
      unavailable: 0
    }
  }

  const count = normalizedProductCodes.codes.length
  let unavailable = 0

  // No products defined for this category
  if (normalizedProductCodes.codes.length === 0) {
    return {
      status: ItemStatus.UNAVAILABLE,
      count,
      unavailable
    }
  }

  // Count how many products are in the outage list
  for (const code of normalizedProductCodes.codes) {
    if (outageProductCodes.includes(code)) {
      unavailable++
    }
  }

  // Determine overall status
  let status: ItemStatus
  if (unavailable === count) {
    status = ItemStatus.UNAVAILABLE
  } else if (unavailable > 0) {
    status = ItemStatus.PARTIAL_AVAILABLE
  } else {
    status = ItemStatus.AVAILABLE
  }

  return {
    status,
    count,
    unavailable
  }
}

/**
 * Calculate store product availability from outage codes and country config.
 * This is the core transformation logic, completely independent of I/O
 *
 * @param outageProductCodes - Product codes that are currently unavailable
 * @param countryInfo - Country-specific product code configuration
 * @returns Complete product availability for the store
 */
export function calculateStoreProductAvailability(
  outageProductCodes: string[],
  countryInfo: ICountryInfos
): StoreProductAvailability {
  const { productCodes, customItems = {} } = countryInfo

  const milkshake = checkProductAvailability(
    outageProductCodes,
    productCodes.MILCHSHAKE
  )
  const mcFlurry = checkProductAvailability(
    outageProductCodes,
    productCodes.MCFLURRY
  )
  const mcSundae = checkProductAvailability(
    outageProductCodes,
    productCodes.MCSUNDAE
  )

  const custom = Object.entries(customItems).map(([name, codes]) => ({
    name,
    ...checkProductAvailability(outageProductCodes, codes)
  }))

  return {
    milkshake,
    mcFlurry,
    mcSundae,
    custom
  }
}

/**
 * Fetches outage data through a regional adapter and calculates product availability.
 */
export class StoreProductAvailabilityFetcher {
  constructor(private readonly apiClient: McdonaldsApiClient) {}

  /**
   * Fetch and calculate product availability for a store.
   *
   * @param store - Store to check
   * @param countryInfo - Country configuration with product codes
   * @param token - Bearer token for API authentication
   * @param clientId - Client ID for API authentication
   * @returns Product availability; network failures reject for polling health tracking
   */
  async fetchStoreProductAvailability(
    store: ProductAvailabilityStore,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<StoreProductAvailability> {
    const headers: McdonaldsRequestHeaders = {
      authorization: `Bearer ${token}`,
      clientId,
      marketId: store.market
    }

    const response = await this.apiClient.fetchRestaurantOutages(
      store.nationalStoreNumber,
      headers
    )

    return calculateStoreProductAvailability(
      response.outageProductCodes,
      countryInfo
    )
  }
}

/**
 * Create a store product-availability fetcher.
 */
export function createStoreProductAvailabilityFetcher(
  apiClient: McdonaldsApiClient
): StoreProductAvailabilityFetcher {
  return new StoreProductAvailabilityFetcher(apiClient)
}
