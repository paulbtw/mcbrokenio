import { prisma } from '@mcbroken/db/client'

import { createApiClient } from '../../clients/McdonaldsApiClient'
import { createStoreProductAvailabilityFetcher } from '../../clients/ProductAvailability'
import {
  defaultRequestLimiterAu,
  defaultRequestLimiterEu,
  defaultRequestLimiterUs,
  type RequestLimiter
} from '../../constants/RateLimit'
import {
  getMarketCodes,
  selectMarketDefinitions
} from '../../markets/marketDefinitions'
import {
  addBreadcrumb,
  type BatchFailureSample,
  captureBatchSummary
} from '../../sentry'
import { APIType } from '../../types'
import { getBearerToken } from '../token/getBearerToken'
import { getClientId } from '../token/getClientId'

import {
  AvailabilityPollingModule,
  type AvailabilityPollRequest,
  type AvailabilityPollResult
} from './AvailabilityPollingModule'
import { PrismaAvailabilityPollPersistence } from './availabilityPollPersistence'
import { ProductAvailabilityNetwork } from './productAvailabilityNetwork'

function getRequestLimiter(apiType: APIType): RequestLimiter {
  switch (apiType) {
    case APIType.AP:
      return defaultRequestLimiterAu
    case APIType.EL:
    case APIType.EU:
      return defaultRequestLimiterEu
    case APIType.US:
      return defaultRequestLimiterUs
    case APIType.HK:
    case APIType.UNKNOWN:
      throw new Error(`Availability polling is not supported for ${apiType}`)
  }
}

function logStoreFailure(sample: BatchFailureSample): void {
  console.error('Product availability request failed', sample)
}

const productAvailabilityNetwork = new ProductAvailabilityNetwork({
  async loadPollContext(apiType, catalogScopes) {
    return {
      token: await getBearerToken(apiType),
      clientId: getClientId(apiType),
      markets: selectMarketDefinitions(apiType, catalogScopes)
    }
  },
  createProductAvailabilityFetcher(apiType) {
    return createStoreProductAvailabilityFetcher(createApiClient(apiType))
  },
  getRequestLimiter
})

const availabilityPollPersistence = new PrismaAvailabilityPollPersistence(
  prisma
)

const availabilityPollingModule = new AvailabilityPollingModule({
  getMarketCodes,
  findEligibleStores: (marketCodes) =>
    availabilityPollPersistence.loadEligibleStores(marketCodes),
  fetchProductAvailabilityBatch: (input) =>
    productAvailabilityNetwork.fetchBatch(input),
  persistUpdates: (updates) => availabilityPollPersistence.saveUpdates(updates),
  addBreadcrumb,
  captureBatchSummary,
  logStoreFailure,
  now: Date.now
})

/**
 * Polls eligible stores and persists their latest product availability.
 *
 * @param request - Regional API and optional countries to poll
 * @returns A summary of polling and persistence outcomes
 */
export async function pollAvailability(
  request: AvailabilityPollRequest
): Promise<AvailabilityPollResult> {
  return availabilityPollingModule.poll(request)
}

export type {
  AvailabilityPollMarketResult,
  AvailabilityPollRequest,
  AvailabilityPollResult
} from './AvailabilityPollingModule'
