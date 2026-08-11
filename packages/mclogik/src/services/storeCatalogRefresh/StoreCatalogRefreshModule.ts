import { type NetworkFailure } from '../../clients/networkFailure'
import {
  type CatalogScopeRefreshInput,
  type CatalogScopeRefreshResult
} from '../../repositories'
import { type APIType, type CreatePos, type Locations } from '../../types'

import { type StoreCatalogDiscoveryBatch } from './storeCatalogDiscoveryNetwork'

export interface StoreCatalogRefreshRequest {
  apiType: APIType
  catalogScopes?: Locations[]
  /** @deprecated Use `catalogScopes`. Retained at the Lambda input boundary. */
  countryList?: Locations[]
}

export interface StoreCatalogMarketResult {
  requests: number
  successful: number
  failed: number
  stores: number
}

export interface StoreCatalogRefreshResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  skippedMarkets: number
  storesDiscovered: number
  storesPersisted: number
  marketBreakdown: Record<string, StoreCatalogMarketResult>
  durationMs: number
}

export interface StoreCatalogRefreshDependencies {
  discoverStoreCatalogBatch(input: {
    apiType: APIType
    catalogScopes?: Locations[]
  }): Promise<StoreCatalogDiscoveryBatch>
  recordScopeRefresh(
    input: CatalogScopeRefreshInput
  ): Promise<CatalogScopeRefreshResult>
  getExpectedCatalogScopes(apiType: APIType, marketCode: string): string[]
  getCatalogCycleId(date: Date): string
  currentDate(): Date
  logDiscoveryFailure(
    failure: NetworkFailure,
    context: { apiType: APIType; market: string }
  ): void
  now(): number
}

interface ScopeOutcome {
  market: string
  catalogScope: string
  plannedRequests: number
  successful: number
  failed: number
  storesById: Map<string, CreatePos>
}

function createMarketResult(requests = 0): StoreCatalogMarketResult {
  return { requests, successful: 0, failed: 0, stores: 0 }
}

export class StoreCatalogRefreshModule {
  constructor(private readonly dependencies: StoreCatalogRefreshDependencies) {}

  async refresh(
    request: StoreCatalogRefreshRequest
  ): Promise<StoreCatalogRefreshResult> {
    const startTime = this.dependencies.now()
    const { apiType } = request
    const catalogScopes = request.catalogScopes ?? request.countryList
    const batch = await this.dependencies.discoverStoreCatalogBatch({
      apiType,
      catalogScopes
    })
    const marketBreakdown: Record<string, StoreCatalogMarketResult> =
      Object.fromEntries(
        Object.entries(batch.requestsByMarket).map(([market, requests]) => [
          market,
          createMarketResult(requests)
        ])
      )

    if (batch.scopes.length === 0) {
      return this.createResult(
        marketBreakdown,
        batch.skippedMarkets,
        0,
        0,
        startTime
      )
    }

    const scopeOutcomes = new Map<string, ScopeOutcome>(
      batch.scopes.map((scope) => [
        scope.catalogScope,
        {
          ...scope,
          successful: 0,
          failed: 0,
          storesById: new Map<string, CreatePos>()
        }
      ])
    )
    const storesById = new Map<string, CreatePos>()
    let successfulRequests = 0
    let failedRequests = 0

    for (const outcome of batch.outcomes) {
      const marketResult =
        marketBreakdown[outcome.market] ?? createMarketResult()
      marketBreakdown[outcome.market] = marketResult
      const scopeOutcome = scopeOutcomes.get(outcome.catalogScope)
      if (scopeOutcome == null) {
        throw new Error(
          `Store discovery returned unknown Catalog Scope ${outcome.catalogScope}`
        )
      }

      if (outcome.failure != null) {
        failedRequests++
        marketResult.failed++
        scopeOutcome.failed++
        this.dependencies.logDiscoveryFailure(outcome.failure, {
          apiType,
          market: outcome.market
        })
        continue
      }

      successfulRequests++
      marketResult.successful++
      scopeOutcome.successful++

      for (const store of outcome.stores) {
        scopeOutcome.storesById.set(store.id as string, store)
        if (!storesById.has(store.id as string)) {
          storesById.set(store.id as string, store)
          marketResult.stores++
        }
      }
    }

    const observedAt = this.dependencies.currentDate()
    const cycleId = this.dependencies.getCatalogCycleId(observedAt)
    const persistedStoreIds = new Set<string>()

    for (const scopeOutcome of scopeOutcomes.values()) {
      const scopeStores = Array.from(scopeOutcome.storesById.values())
      const persistenceResult = await this.dependencies.recordScopeRefresh({
        cycleId,
        country: scopeOutcome.market,
        scope: scopeOutcome.catalogScope,
        expectedScopes: this.dependencies.getExpectedCatalogScopes(
          apiType,
          scopeOutcome.market
        ),
        complete:
          scopeOutcome.failed === 0 &&
          scopeOutcome.successful === scopeOutcome.plannedRequests,
        stores: scopeStores,
        observedAt
      })

      if (persistenceResult.storesPersisted > 0) {
        for (const store of scopeStores) {
          persistedStoreIds.add(store.id as string)
        }
      }
    }

    const completedRequests = successfulRequests + failedRequests
    const plannedRequests = batch.scopes.reduce(
      (sum, scope) => sum + scope.plannedRequests,
      0
    )

    if (batch.circuitOpened && successfulRequests === 0) {
      throw new Error('Store discovery aborted after repeated failures')
    }
    if (successfulRequests === 0 && failedRequests > 0) {
      throw new Error('All store discovery requests failed')
    }
    if (failedRequests > 0) {
      throw new Error(
        `${failedRequests} of ${completedRequests} store discovery requests failed`
      )
    }
    if (completedRequests !== plannedRequests) {
      throw new Error(
        'Store discovery batch did not complete all planned requests'
      )
    }

    return this.createResult(
      marketBreakdown,
      batch.skippedMarkets,
      storesById.size,
      persistedStoreIds.size,
      startTime
    )
  }

  private createResult(
    marketBreakdown: Record<string, StoreCatalogMarketResult>,
    skippedMarkets: number,
    storesDiscovered: number,
    storesPersisted: number,
    startTime: number
  ): StoreCatalogRefreshResult {
    const marketResults = Object.values(marketBreakdown)

    return {
      totalRequests: marketResults.reduce(
        (sum, market) => sum + market.requests,
        0
      ),
      successfulRequests: marketResults.reduce(
        (sum, market) => sum + market.successful,
        0
      ),
      failedRequests: marketResults.reduce(
        (sum, market) => sum + market.failed,
        0
      ),
      skippedMarkets,
      storesDiscovered,
      storesPersisted,
      marketBreakdown,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
