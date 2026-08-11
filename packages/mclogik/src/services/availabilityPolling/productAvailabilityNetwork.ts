import { type Pos } from '@mcbroken/db'

import {
  createInvalidResponseFailure,
  createNetworkFailure,
  type NetworkFailure
} from '../../clients/networkFailure'
import { type StoreProductAvailability } from '../../clients/ProductAvailability'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type MarketDefinition } from '../../markets/marketDefinitions'
import { type APIType, type Locations } from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

interface ProductAvailabilityPollContext {
  token: string
  clientId: string
  markets: MarketDefinition[]
}

interface StoreProductAvailabilityFetcher {
  fetchStoreProductAvailability(
    store: ProductAvailabilityStore,
    market: MarketDefinition,
    token: string,
    clientId: string
  ): Promise<StoreProductAvailability>
}

export interface ProductAvailabilityNetworkDependencies {
  loadPollContext(
    apiType: APIType,
    catalogScopes?: Locations[]
  ): Promise<ProductAvailabilityPollContext>
  createProductAvailabilityFetcher(
    apiType: APIType
  ): StoreProductAvailabilityFetcher
  getRequestLimiter(apiType: APIType): RequestLimiter
}

export interface ProductAvailabilityBatchRequest {
  apiType: APIType
  catalogScopes?: Locations[]
  stores: ProductAvailabilityStore[]
}

export type ProductAvailabilityStore = Pick<
  Pos,
  'id' | 'nationalStoreNumber' | 'country' | 'errorCounter'
>

export type ProductAvailabilityBatchOutcome =
  | {
      outcome: 'success'
      store: ProductAvailabilityStore
      availability: StoreProductAvailability
    }
  | {
      outcome: 'failure'
      store: ProductAvailabilityStore
      failure: NetworkFailure
    }
  | {
      outcome: 'skipped'
      store: ProductAvailabilityStore
      reason: 'market-not-configured'
    }

interface PlannedAvailabilityRequest {
  index: number
  store: ProductAvailabilityStore
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
    const { apiType, catalogScopes, stores } = request
    assertSupportedApiType(apiType)
    let context: ProductAvailabilityPollContext
    try {
      context = await this.dependencies.loadPollContext(apiType, catalogScopes)
    } catch (error) {
      if (createNetworkFailure(error) != null) {
        throw new Error('Product Availability authentication request failed')
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
      markets.map((market) => [market.country, market])
    )
    const outcomes: Array<ProductAvailabilityBatchOutcome | undefined> =
      new Array(stores.length)
    const plannedRequests: PlannedAvailabilityRequest[] = []

    stores.forEach((store, index) => {
      const market = marketsByCode.get(store.country as Locations)
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
