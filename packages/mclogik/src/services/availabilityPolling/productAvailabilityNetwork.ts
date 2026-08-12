import {
  createInvalidResponseFailure,
  createNetworkFailure,
  type NetworkFailure,
  NetworkFailureError
} from '../../clients/networkFailure'
import { type StoreProductAvailability } from '../../clients/ProductAvailability'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type MarketDefinition } from '../../markets/marketDefinitions'
import { type APIType, type MarketCode } from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

import { type AvailabilityPollStore } from './availabilityPollTypes'

interface ProductAvailabilityPollContext {
  token: string
  clientId: string
  markets: MarketDefinition[]
}

interface StoreProductAvailabilityFetcher {
  fetchStoreProductAvailability(
    store: AvailabilityPollStore,
    market: MarketDefinition,
    token: string,
    clientId: string
  ): Promise<StoreProductAvailability>
}

export interface ProductAvailabilityNetworkDependencies {
  loadPollContext(
    apiType: APIType,
    markets?: MarketCode[]
  ): Promise<ProductAvailabilityPollContext>
  createProductAvailabilityFetcher(
    apiType: APIType
  ): StoreProductAvailabilityFetcher
  getRequestLimiter(apiType: APIType): RequestLimiter
}

export interface ProductAvailabilityBatchRequest {
  apiType: APIType
  markets?: MarketCode[]
  stores: AvailabilityPollStore[]
}

export type ProductAvailabilityBatchOutcome =
  | {
      outcome: 'success'
      store: AvailabilityPollStore
      availability: StoreProductAvailability
    }
  | {
      outcome: 'failure'
      store: AvailabilityPollStore
      failure: NetworkFailure
    }
  | {
      outcome: 'skipped'
      store: AvailabilityPollStore
      reason: 'market-not-configured'
    }

interface PlannedAvailabilityRequest {
  index: number
  store: AvailabilityPollStore
  market: MarketDefinition
}

function assertSupportedApiType(apiType: APIType): void {
  if (apiType === 'HK' || apiType === 'UNKNOWN') {
    throw new Error(`Availability polling is not supported for ${apiType}`)
  }
}

export class ProductAvailabilityNetwork {
  constructor(
    private readonly dependencies: ProductAvailabilityNetworkDependencies
  ) {}

  async fetchBatch(
    request: ProductAvailabilityBatchRequest
  ): Promise<ProductAvailabilityBatchOutcome[]> {
    const { apiType, markets: requestedMarkets, stores } = request
    assertSupportedApiType(apiType)
    let context: ProductAvailabilityPollContext
    try {
      context = await this.dependencies.loadPollContext(
        apiType,
        requestedMarkets
      )
    } catch (error) {
      const failure = createNetworkFailure(error)
      if (failure != null) {
        throw new NetworkFailureError(
          'Product Availability authentication request failed',
          failure
        )
      }
      throw error
    }
    const { token, clientId, markets } = context

    if (typeof token !== 'string' || token.length === 0) {
      throw new Error(`Bearer token is missing for ${apiType}`)
    }
    if (typeof clientId !== 'string' || clientId.length === 0) {
      throw new Error(`Client id is missing for ${apiType}`)
    }

    const marketsByCode = new Map(
      markets.map((market) => [market.market, market])
    )
    const outcomes: Array<ProductAvailabilityBatchOutcome | undefined> =
      new Array(stores.length)
    const plannedRequests: PlannedAvailabilityRequest[] = []

    stores.forEach((store, index) => {
      const market = marketsByCode.get(store.market)
      if (market == null) {
        outcomes[index] = {
          outcome: 'skipped',
          store,
          reason: 'market-not-configured'
        }
        return
      }

      plannedRequests.push({ index, store, market })
    })

    if (plannedRequests.length > 0) {
      const fetcher =
        this.dependencies.createProductAvailabilityFetcher(apiType)
      const executor = createRateLimitedExecutor(
        this.dependencies.getRequestLimiter(apiType),
        'ProductAvailabilityNetwork'
      )
      const abortController = new AbortController()
      let programmingDefect: unknown

      const { results } = await executor.executeAll(
        plannedRequests,
        async ({ index, store, market }) => {
          try {
            const availability = await fetcher.fetchStoreProductAvailability(
              store,
              market,
              token,
              clientId
            )
            const outcome: ProductAvailabilityBatchOutcome =
              availability == null
                ? {
                    outcome: 'failure',
                    store,
                    failure: createInvalidResponseFailure()
                  }
                : { outcome: 'success', store, availability }

            return { index, outcome }
          } catch (error) {
            const failure = createNetworkFailure(error)
            if (failure != null) {
              return {
                index,
                outcome: {
                  outcome: 'failure' as const,
                  store,
                  failure
                }
              }
            }

            programmingDefect ??= error
            abortController.abort(programmingDefect)
            return null
          }
        },
        { signal: abortController.signal }
      )

      if (programmingDefect != null) {
        throw programmingDefect
      }

      for (const result of results) {
        outcomes[result.index] = result.outcome
      }
    }

    return outcomes.filter(
      (outcome): outcome is ProductAvailabilityBatchOutcome => outcome != null
    )
  }
}
