import { ItemStatus, type Pos } from '@mcbroken/db'

import { type ICountryInfos } from '../types'

import {
  type McdonaldsApiClient,
  type McdonaldsRequestHeaders
} from './McdonaldsApiClient'

/**
 * Special marker used in country configurations to indicate that a product
 * category is not applicable for a particular market (e.g., sundaes in UK).
 *
 * When this marker is present in the product codes array, the product
 * category will be marked as NOT_APPLICABLE instead of checking availability.
 *
 * Note: This uses a distinct value to avoid confusion with the ItemStatus enum.
 */
export const NOT_APPLICABLE_MARKER = '__NOT_APPLICABLE__'

/**
 * Status result for a single product category
 */
export interface ProductStatus {
  status: ItemStatus
  count: number
  unavailable: number
  name?: string
}

/**
 * Complete item status for a store
 */
export interface StoreItemStatus {
  milkshake: ProductStatus
  mcFlurry: ProductStatus
  mcSundae: ProductStatus
  custom: ProductStatus[]
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
  productCodes: string[]
): Omit<ProductStatus, 'name'> {
  const count = productCodes.length
  let unavailable = 0

  // No products defined for this category
  if (productCodes.length === 0) {
    return {
      status: ItemStatus.UNAVAILABLE,
      count,
      unavailable
    }
  }

  // Special marker indicating product is not applicable for this market
  if (productCodes.includes(NOT_APPLICABLE_MARKER)) {
    return {
      status: ItemStatus.NOT_APPLICABLE,
      count,
      unavailable
    }
  }

  // Count how many products are in the outage list
  for (const code of productCodes) {
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
 * Pure function to calculate item status from outage codes and country config
 * This is the core transformation logic, completely independent of I/O
 *
 * @param outageProductCodes - Product codes that are currently unavailable
 * @param countryInfo - Country-specific product code configuration
 * @returns Complete item status for the store
 */
export function calculateStoreItemStatus(
  outageProductCodes: string[],
  countryInfo: ICountryInfos
): StoreItemStatus {
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
 * Service class for fetching and calculating item status
 * Combines API client with pure business logic
 */
export class ItemStatusService {
  constructor(private readonly apiClient: McdonaldsApiClient) {}

  /**
   * Fetch and calculate item status for a store
   *
   * @param pos - Store to check
   * @param countryInfo - Country configuration with product codes
   * @param token - Bearer token for API authentication
   * @param clientId - Client ID for API authentication
   * @returns Item status or null if unable to fetch
   */
  async getStoreItemStatus(
    pos: Pos,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<StoreItemStatus | null> {
    const headers: McdonaldsRequestHeaders = {
      authorization: `Bearer ${token}`,
      clientId,
      marketId: pos.country
    }

    const response = await this.apiClient.fetchRestaurantOutages(
      pos.nationalStoreNumber,
      headers
    )

    // If the API call failed, return null to indicate we couldn't check
    // This distinguishes "no outages" (success=true, empty array) from "couldn't check" (success=false)
    if (!response.success) {
      return null
    }

    return calculateStoreItemStatus(response.outageProductCodes, countryInfo)
  }
}

/**
 * Factory function to create an ItemStatusService
 */
export function createItemStatusService(
  apiClient: McdonaldsApiClient
): ItemStatusService {
  return new ItemStatusService(apiClient)
}
