import {
  createNetworkFailure,
  type NetworkFailure,
  NetworkFailureError
} from '../../clients/networkFailure'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type MarketDefinition } from '../../markets/marketDefinitions'
import {
  APIType,
  type CatalogScope,
  type CreatePos,
  type ILocation,
  type MarketCode
} from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

const MAX_CONSECUTIVE_DISCOVERY_FAILURES = 24

interface StoreCatalogRefreshContextBase {
  markets: MarketDefinition[]
}

interface AuthenticatedLocationRefreshContext
  extends StoreCatalogRefreshContextBase {
  mode: 'authenticated-location'
  token: string
  clientId: string
}

interface UrlRefreshContext extends StoreCatalogRefreshContextBase {
  mode: 'url'
}

type StoreCatalogRefreshContext =
  | AuthenticatedLocationRefreshContext
  | UrlRefreshContext

export interface StoreCatalogDiscoveryNetworkDependencies {
  loadRefreshContext(
    apiType: APIType,
    catalogScopes?: CatalogScope[]
  ): Promise<StoreCatalogRefreshContext>
  generateLocationMesh(
    market: MarketDefinition,
    intervalKilometers: number
  ): ILocation[]
  discoverFromLocation(
    location: ILocation,
    market: MarketDefinition,
    token: string,
    clientId: string
  ): Promise<CreatePos[]>
  discoverFromUrl(market: MarketDefinition): Promise<CreatePos[]>
  getRequestLimiter(apiType: APIType): RequestLimiter
  getLocationIntervalKilometers(apiType: APIType): number
}

export interface StoreCatalogDiscoveryBatchRequest {
  apiType: APIType
  catalogScopes?: CatalogScope[]
}

export interface StoreCatalogDiscoveryOutcome {
  index: number
  market: MarketCode
  catalogScope: CatalogScope
  stores: CreatePos[]
  failure?: NetworkFailure
}

export interface StoreCatalogDiscoveryScope {
  market: MarketCode
  catalogScope: CatalogScope
  plannedRequests: number
}

export interface StoreCatalogDiscoveryBatch {
  requestsByMarket: Record<string, number>
  scopes: StoreCatalogDiscoveryScope[]
  skippedMarkets: number
  circuitOpened: boolean
  outcomes: StoreCatalogDiscoveryOutcome[]
}

type DiscoveryRequest =
  | {
      index: number
      kind: 'location'
      market: MarketDefinition
      location: ILocation
    }
  | {
      index: number
      kind: 'url'
      market: MarketDefinition
    }

function assertSupportedApiType(apiType: APIType): void {
  if (apiType === APIType.HK || apiType === APIType.UNKNOWN) {
    throw new Error(`Store Catalog refresh is not supported for ${apiType}`)
  }
}

function assertCompatibleRefreshContext(
  apiType: APIType,
  context: StoreCatalogRefreshContext
): void {
  if (apiType === APIType.EL && context.mode !== 'url') {
    throw new Error('URL discovery context is required for EL')
  }
  if (apiType !== APIType.EL && context.mode !== 'authenticated-location') {
    throw new Error(`Location discovery credentials are missing for ${apiType}`)
  }
}

export class StoreCatalogDiscoveryNetwork {
  constructor(
    private readonly dependencies: StoreCatalogDiscoveryNetworkDependencies
  ) {}

  async discoverBatch(
    request: StoreCatalogDiscoveryBatchRequest
  ): Promise<StoreCatalogDiscoveryBatch> {
    const { apiType, catalogScopes } = request
    assertSupportedApiType(apiType)
    let context: StoreCatalogRefreshContext
    try {
      context = await this.dependencies.loadRefreshContext(
        apiType,
        catalogScopes
      )
    } catch (error) {
      const failure = createNetworkFailure(error)
      if (failure != null) {
        throw new NetworkFailureError(
          'Store Catalog authentication request failed',
          failure
        )
      }
      throw error
    }
    assertCompatibleRefreshContext(apiType, context)
    const { markets } = context

    if (
      context.mode === 'authenticated-location' &&
      (typeof context.token !== 'string' || context.token.length === 0)
    ) {
      throw new Error(`Bearer token is missing for ${apiType}`)
    }
    if (
      context.mode === 'authenticated-location' &&
      (typeof context.clientId !== 'string' || context.clientId.length === 0)
    ) {
      throw new Error(`Client id is missing for ${apiType}`)
    }

    const discoveryRequests: DiscoveryRequest[] = []
    const requestsByMarket: Record<string, number> = {}
    let skippedMarkets = 0

    for (const market of markets) {
      if (context.mode === 'url') {
        discoveryRequests.push({
          index: discoveryRequests.length,
          kind: 'url',
          market
        })
        requestsByMarket[market.market] =
          (requestsByMarket[market.market] ?? 0) + 1
        continue
      }

      if (market.country === 'UK') {
        skippedMarkets++
        continue
      }
      if (market.locationLimits == null) {
        throw new Error(`No locations found for ${market.country}`)
      }

      const locations = this.dependencies.generateLocationMesh(
        market,
        this.dependencies.getLocationIntervalKilometers(apiType)
      )
      requestsByMarket[market.market] =
        (requestsByMarket[market.market] ?? 0) + locations.length

      for (const location of locations) {
        discoveryRequests.push({
          index: discoveryRequests.length,
          kind: 'location',
          market,
          location
        })
      }
    }

    const scopesByCatalogScope = new Map<
      CatalogScope,
      StoreCatalogDiscoveryScope
    >()
    for (const discoveryRequest of discoveryRequests) {
      const catalogScope = discoveryRequest.market.catalogScope
      const existing = scopesByCatalogScope.get(catalogScope)
      if (existing != null) {
        existing.plannedRequests++
      } else {
        scopesByCatalogScope.set(catalogScope, {
          market: discoveryRequest.market.market,
          catalogScope,
          plannedRequests: 1
        })
      }
    }

    if (discoveryRequests.length === 0) {
      return {
        requestsByMarket,
        scopes: [],
        skippedMarkets,
        circuitOpened: false,
        outcomes: []
      }
    }

    const executor = createRateLimitedExecutor(
      this.dependencies.getRequestLimiter(apiType),
      'StoreCatalogDiscoveryNetwork'
    )
    const abortController = new AbortController()
    let consecutiveFailures = 0
    let circuitOpened = false
    let programmingDefect: unknown

    const { results: outcomes } = await executor.executeAll(
      discoveryRequests,
      async (
        discoveryRequest
      ): Promise<StoreCatalogDiscoveryOutcome | null> => {
        const market = discoveryRequest.market.market
        const catalogScope = discoveryRequest.market.catalogScope

        try {
          let stores: CreatePos[]
          if (discoveryRequest.kind === 'url') {
            stores = await this.dependencies.discoverFromUrl(
              discoveryRequest.market
            )
          } else if (context.mode === 'authenticated-location') {
            stores = await this.dependencies.discoverFromLocation(
              discoveryRequest.location,
              discoveryRequest.market,
              context.token,
              context.clientId
            )
          } else {
            throw new Error('Location discovery request has no credentials')
          }
          consecutiveFailures = 0

          return {
            index: discoveryRequest.index,
            market,
            catalogScope,
            stores
          }
        } catch (error) {
          const failure = createNetworkFailure(error)
          if (failure == null) {
            programmingDefect ??= error
            abortController.abort(programmingDefect)
            return null
          }

          consecutiveFailures++
          if (
            consecutiveFailures >= MAX_CONSECUTIVE_DISCOVERY_FAILURES &&
            !abortController.signal.aborted
          ) {
            circuitOpened = true
            abortController.abort(
              new Error(
                `Store discovery aborted after ${MAX_CONSECUTIVE_DISCOVERY_FAILURES} consecutive failures`
              )
            )
          }

          return {
            index: discoveryRequest.index,
            market,
            catalogScope,
            stores: [],
            failure
          }
        }
      },
      { signal: abortController.signal }
    )

    if (programmingDefect != null) {
      throw programmingDefect
    }

    outcomes.sort((left, right) => left.index - right.index)

    return {
      requestsByMarket,
      scopes: Array.from(scopesByCatalogScope.values()),
      skippedMarkets,
      circuitOpened,
      outcomes
    }
  }
}
