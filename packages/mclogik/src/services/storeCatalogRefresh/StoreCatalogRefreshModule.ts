import { type RequestLimiter } from '../../constants/RateLimit'
import {
  type CatalogScopeRefreshInput,
  type CatalogScopeRefreshResult
} from '../../repositories'
import {
  APIType,
  type CreatePos,
  type ICountryInfos,
  type ILocation,
  type Locations
} from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

/**
 * Three full failure waves at the production location-discovery concurrency of
 * eight. Because requests complete concurrently, "consecutive" means observed
 * completion order; any successful completion resets the count. Opening the
 * breaker cancels queued work, while completed successes remain persistable.
 */
const MAX_CONSECUTIVE_DISCOVERY_FAILURES = 24

export interface StoreCatalogRefreshRequest {
  apiType: APIType
  countryList?: Locations[]
}

export interface StoreCatalogCountryResult {
  requests: number
  successful: number
  failed: number
  stores: number
}

export interface StoreCatalogRefreshResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  skippedCountries: number
  storesDiscovered: number
  storesPersisted: number
  countryBreakdown: Record<string, StoreCatalogCountryResult>
  durationMs: number
}

interface StoreCatalogRefreshContext {
  token: string
  clientId: string
  countryInfos: ICountryInfos[]
}

export interface StoreCatalogRefreshDependencies {
  loadRefreshContext(
    apiType: APIType,
    countryList?: Locations[]
  ): Promise<StoreCatalogRefreshContext>
  generateLocationMesh(
    countryInfo: ICountryInfos,
    intervalKilometers: number
  ): ILocation[]
  discoverFromLocation(
    location: ILocation,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<CreatePos[]>
  discoverFromUrl(countryInfo: ICountryInfos): Promise<CreatePos[]>
  recordScopeRefresh(
    input: CatalogScopeRefreshInput
  ): Promise<CatalogScopeRefreshResult>
  getExpectedCatalogScopes(apiType: APIType, country: string): string[]
  getCatalogCycleId(date: Date): string
  currentDate(): Date
  getRequestLimiter(apiType: APIType): RequestLimiter
  getLocationIntervalKilometers(apiType: APIType): number
  logDiscoveryFailure(
    error: unknown,
    context: { apiType: APIType; country: string }
  ): void
  now(): number
}

type DiscoveryRequest =
  | {
      index: number
      kind: 'location'
      countryInfo: ICountryInfos
      location: ILocation
    }
  | {
      index: number
      kind: 'url'
      countryInfo: ICountryInfos
    }

interface DiscoveryOutcome {
  index: number
  country: string
  scope: string
  stores: CreatePos[]
  error?: unknown
}

interface ScopeOutcome {
  country: string
  scope: string
  plannedRequests: number
  successful: number
  failed: number
  storesById: Map<string, CreatePos>
}

function createCountryResult(): StoreCatalogCountryResult {
  return { requests: 0, successful: 0, failed: 0, stores: 0 }
}

export class StoreCatalogRefreshModule {
  constructor(private readonly dependencies: StoreCatalogRefreshDependencies) {}

  async refresh(
    request: StoreCatalogRefreshRequest
  ): Promise<StoreCatalogRefreshResult> {
    const startTime = this.dependencies.now()
    const { apiType, countryList } = request
    const { token, clientId, countryInfos } =
      await this.dependencies.loadRefreshContext(apiType, countryList)
    const countryBreakdown: Record<string, StoreCatalogCountryResult> = {}
    let skippedCountries = 0
    const discoveryRequests: DiscoveryRequest[] = []

    if (apiType === APIType.EL) {
      for (const countryInfo of countryInfos) {
        const countryResult =
          countryBreakdown[countryInfo.country] ?? createCountryResult()
        countryResult.requests += 1
        countryBreakdown[countryInfo.country] = countryResult
        discoveryRequests.push({
          index: discoveryRequests.length,
          kind: 'url',
          countryInfo
        })
      }
    } else if (countryInfos.length > 0) {
      const intervalKilometers =
        this.dependencies.getLocationIntervalKilometers(apiType)

      for (const countryInfo of countryInfos) {
        if (countryInfo.country === 'UK') {
          skippedCountries++
          continue
        }

        if (countryInfo.locationLimits == null) {
          throw new Error(`No locations found for ${countryInfo.country}`)
        }

        const locations = this.dependencies.generateLocationMesh(
          countryInfo,
          intervalKilometers
        )
        const countryResult =
          countryBreakdown[countryInfo.country] ?? createCountryResult()
        countryResult.requests += locations.length
        countryBreakdown[countryInfo.country] = countryResult

        for (const location of locations) {
          discoveryRequests.push({
            index: discoveryRequests.length,
            kind: 'location',
            countryInfo,
            location
          })
        }
      }
    }

    if (discoveryRequests.length === 0) {
      return this.createResult(
        countryBreakdown,
        skippedCountries,
        0,
        0,
        startTime
      )
    }

    const plannedRequestsByScope = new Map<string, number>()
    for (const discoveryRequest of discoveryRequests) {
      const scope =
        discoveryRequest.countryInfo.catalogScope ??
        discoveryRequest.countryInfo.country
      plannedRequestsByScope.set(
        scope,
        (plannedRequestsByScope.get(scope) ?? 0) + 1
      )
    }

    const requestLimiter = this.dependencies.getRequestLimiter(apiType)
    const executor = createRateLimitedExecutor(
      requestLimiter,
      'StoreCatalogRefreshModule'
    )
    const abortController = new AbortController()
    let consecutiveFailures = 0
    let circuitBreakerError: Error | undefined
    const { results: outcomes } = await executor.executeAll(
      discoveryRequests,
      async (discoveryRequest): Promise<DiscoveryOutcome> => {
        try {
          const stores =
            discoveryRequest.kind === 'url'
              ? await this.dependencies.discoverFromUrl(
                  discoveryRequest.countryInfo
                )
              : await this.dependencies.discoverFromLocation(
                  discoveryRequest.location,
                  discoveryRequest.countryInfo,
                  token,
                  clientId
                )

          consecutiveFailures = 0

          return {
            index: discoveryRequest.index,
            country: discoveryRequest.countryInfo.country,
            scope:
              discoveryRequest.countryInfo.catalogScope ??
              discoveryRequest.countryInfo.country,
            stores
          }
        } catch (error) {
          consecutiveFailures++
          this.dependencies.logDiscoveryFailure(error, {
            apiType,
            country: discoveryRequest.countryInfo.country
          })

          if (
            consecutiveFailures >= MAX_CONSECUTIVE_DISCOVERY_FAILURES &&
            !abortController.signal.aborted
          ) {
            circuitBreakerError = new Error(
              `Store discovery aborted after ${MAX_CONSECUTIVE_DISCOVERY_FAILURES} consecutive failures`
            )
            abortController.abort()
          }

          return {
            index: discoveryRequest.index,
            country: discoveryRequest.countryInfo.country,
            scope:
              discoveryRequest.countryInfo.catalogScope ??
              discoveryRequest.countryInfo.country,
            stores: [],
            error
          }
        }
      },
      { signal: abortController.signal }
    )

    outcomes.sort((left, right) => left.index - right.index)
    const storesById = new Map<string, CreatePos>()
    const scopeOutcomes = new Map<string, ScopeOutcome>()
    let successfulRequests = 0
    let failedRequests = 0

    for (const outcome of outcomes) {
      const countryResult = countryBreakdown[outcome.country]!
      const scopeOutcome = scopeOutcomes.get(outcome.scope) ?? {
        country: outcome.country,
        scope: outcome.scope,
        plannedRequests: plannedRequestsByScope.get(outcome.scope) ?? 0,
        successful: 0,
        failed: 0,
        storesById: new Map<string, CreatePos>()
      }
      scopeOutcomes.set(outcome.scope, scopeOutcome)

      if (outcome.error != null) {
        failedRequests++
        countryResult.failed++
        scopeOutcome.failed++
        continue
      }

      successfulRequests++
      countryResult.successful++
      scopeOutcome.successful++

      for (const store of outcome.stores) {
        scopeOutcome.storesById.set(store.id, store)
        if (!storesById.has(store.id)) {
          storesById.set(store.id, store)
          countryResult.stores++
        }
      }
    }

    const allDiscoveryRequestsFailed =
      successfulRequests === 0 && failedRequests > 0

    const observedAt = this.dependencies.currentDate()
    const cycleId = this.dependencies.getCatalogCycleId(observedAt)
    const persistedStoreIds = new Set<string>()

    for (const scopeOutcome of scopeOutcomes.values()) {
      const scopeStores = Array.from(scopeOutcome.storesById.values())
      const persistenceResult = await this.dependencies.recordScopeRefresh({
        cycleId,
        country: scopeOutcome.country,
        scope: scopeOutcome.scope,
        expectedScopes: this.dependencies.getExpectedCatalogScopes(
          apiType,
          scopeOutcome.country
        ),
        complete:
          scopeOutcome.failed === 0 &&
          scopeOutcome.successful === scopeOutcome.plannedRequests,
        stores: scopeStores,
        observedAt
      })

      if (persistenceResult.storesPersisted > 0) {
        for (const store of scopeStores) {
          persistedStoreIds.add(store.id)
        }
      }
    }

    if (successfulRequests === 0 && circuitBreakerError != null) {
      throw circuitBreakerError
    }

    if (allDiscoveryRequestsFailed) {
      throw new Error('All store discovery requests failed')
    }

    if (failedRequests > 0) {
      throw new Error(
        `${failedRequests} of ${successfulRequests + failedRequests} store discovery requests failed`
      )
    }

    return this.createResult(
      countryBreakdown,
      skippedCountries,
      storesById.size,
      persistedStoreIds.size,
      startTime
    )
  }

  private createResult(
    countryBreakdown: Record<string, StoreCatalogCountryResult>,
    skippedCountries: number,
    storesDiscovered: number,
    storesPersisted: number,
    startTime: number
  ): StoreCatalogRefreshResult {
    const countryResults = Object.values(countryBreakdown)

    return {
      totalRequests: countryResults.reduce(
        (sum, country) => sum + country.requests,
        0
      ),
      successfulRequests: countryResults.reduce(
        (sum, country) => sum + country.successful,
        0
      ),
      failedRequests: countryResults.reduce(
        (sum, country) => sum + country.failed,
        0
      ),
      skippedCountries,
      storesDiscovered,
      storesPersisted,
      countryBreakdown,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
