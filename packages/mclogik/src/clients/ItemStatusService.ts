import { ItemStatus, type Pos } from '@mcbroken/db'

import { type ICountryInfos, type ProductCodeConfig } from '../types'
import { normalizeProductCodeConfig } from '../utils/productCodeConfig'

import {
  type McdonaldsApiClient,
  type McdonaldsRequestHeaders
} from './McdonaldsApiClient'

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
  productCodes: ProductCodeConfig
): Omit<ProductStatus, 'name'> {
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
