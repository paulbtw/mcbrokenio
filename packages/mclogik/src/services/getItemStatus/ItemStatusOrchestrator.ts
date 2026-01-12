import { type Pos } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import {
  createItemStatusService,
  type McdonaldsApiClient,
  type StoreItemStatus} from '../../clients'
import { type RequestLimiter } from '../../constants/RateLimit'
import {
  type PosRepository,
  type UpdatePosStatusInput
} from '../../repositories'
import { type ICountryInfos } from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

const logger = new Logger('ItemStatusOrchestrator')

/**
 * Dependencies required by the ItemStatusOrchestrator
 */
export interface ItemStatusOrchestratorDeps {
  /** Repository for POS data access */
  posRepository: PosRepository
  /** API client for fetching restaurant status */
  apiClient: McdonaldsApiClient
  /** Rate limiting configuration */
  rateLimiter: RequestLimiter
}

/**
 * Configuration for fetching item status
 */
export interface ItemStatusConfig {
  /** Country configurations with product codes */
  countryInfos: ICountryInfos[]
  /** Bearer token for API authentication */
  token: string
  /** Client ID for API authentication */
  clientId: string
}

/**
 * Result of the item status update operation
 */
export interface ItemStatusUpdateResult {
  /** Number of stores checked */
  storesChecked: number
  /** Number of stores successfully updated */
  storesUpdated: number
  /** Number of failures */
  failures: number
}

/**
 * Orchestrates the process of fetching and updating item status for stores
 * This class handles the workflow but delegates actual work to injected dependencies
 */
export class ItemStatusOrchestrator {
  private readonly posRepository: PosRepository
  private readonly apiClient: McdonaldsApiClient
  private readonly rateLimiter: RequestLimiter

  constructor(deps: ItemStatusOrchestratorDeps) {
    this.posRepository = deps.posRepository
    this.apiClient = deps.apiClient
    this.rateLimiter = deps.rateLimiter
  }

  /**
   * Fetch and update item status for all stores in the configured countries
   */
  async updateItemStatus(config: ItemStatusConfig): Promise<ItemStatusUpdateResult> {
    const { countryInfos, token, clientId } = config

    // Build country lookup for quick access
    const countriesRecord = countryInfos.reduce<Record<string, ICountryInfos>>(
      (acc, info) => {
        acc[info.country] = info
        return acc
      },
      {}
    )

    const countries = countryInfos.map((info) => info.country)

    // Fetch stores to check
    const storesToCheck = await this.posRepository.findByCountries(countries, {
      mobileOrderingOnly: true,
      limit: 2000,
      orderByOldestFirst: true
    })

    logger.info(`Found ${storesToCheck.length} stores to check`)

    if (storesToCheck.length === 0) {
      return {
        storesChecked: 0,
        storesUpdated: 0,
        failures: 0
      }
    }

    // Create item status service for API calls
    const itemStatusService = createItemStatusService(this.apiClient)

    // Create rate-limited executor
    const executor = createRateLimitedExecutor(
      this.rateLimiter,
      'ItemStatusOrchestrator'
    )

    // Fetch status for each store with rate limiting
    const { results, failures } = await executor.executeAll(
      storesToCheck,
      async (pos: Pos) => {
        const countryInfo = countriesRecord[pos.country]
        if (!countryInfo) {
          logger.warn(`No country info for store ${pos.id} in ${pos.country}`)
          return null
        }

        const status = await itemStatusService.getStoreItemStatus(
          pos,
          countryInfo,
          token,
          clientId
        )

        if (!status) {
          return null
        }

        return this.mapToUpdateInput(pos, status)
      }
    )

    // Update database with new statuses
    if (results.length > 0) {
      await this.posRepository.updateManyStatus(results)
    }

    return {
      storesChecked: storesToCheck.length,
      storesUpdated: results.length,
      failures
    }
  }

  /**
   * Map store and item status to database update input
   */
  private mapToUpdateInput(pos: Pos, status: StoreItemStatus): UpdatePosStatusInput {
    return {
      id: pos.id,
      milkshakeCount: status.milkshake.count,
      milkshakeError: status.milkshake.unavailable,
      milkshakeStatus: status.milkshake.status,
      mcFlurryCount: status.mcFlurry.count,
      mcFlurryError: status.mcFlurry.unavailable,
      mcFlurryStatus: status.mcFlurry.status,
      mcSundaeCount: status.mcSundae.count,
      mcSundaeError: status.mcSundae.unavailable,
      mcSundaeStatus: status.mcSundae.status,
      customItems: status.custom.map((item) => ({
        name: item.name,
        count: item.count,
        error: item.unavailable,
        status: item.status
      }))
    }
  }
}

/**
 * Factory function to create an ItemStatusOrchestrator
 */
export function createItemStatusOrchestrator(
  deps: ItemStatusOrchestratorDeps
): ItemStatusOrchestrator {
  return new ItemStatusOrchestrator(deps)
}
