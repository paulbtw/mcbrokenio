import { type NetworkFailure } from '../../clients/NetworkFailure'
import {
  type CatalogScopeRefreshInput,
  type CatalogScopeRefreshResult
} from '../../repositories'
import { type APIType, type CreatePos, type Locations } from '../../types'

import { type StoreCatalogDiscoveryBatch } from './StoreCatalogDiscoveryNetwork'

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

export interface StoreCatalogRefreshDependencies {
  discoverStoreCatalogBatch(input: {
    apiType: APIType
    countryList?: Locations[]
  }): Promise<StoreCatalogDiscoveryBatch>
  recordScopeRefresh(
    input: CatalogScopeRefreshInput
  ): Promise<CatalogScopeRefreshResult>
  getExpectedCatalogScopes(apiType: APIType, country: string): string[]
  getCatalogCycleId(date: Date): string
  currentDate(): Date
  logDiscoveryFailure(
    failure: NetworkFailure,
    context: { apiType: APIType; country: string }
  ): void
  now(): number
}

interface ScopeOutcome {
  country: string
  scope: string
  plannedRequests: number
  successful: number
  failed: number
  storesById: Map<string, CreatePos>
}

function createCountryResult(requests = 0): StoreCatalogCountryResult {
  return { requests, successful: 0, failed: 0, stores: 0 }
}

export class StoreCatalogRefreshModule {
  constructor(private readonly dependencies: StoreCatalogRefreshDependencies) {}

  async refresh(
    request: StoreCatalogRefreshRequest
  ): Promise<StoreCatalogRefreshResult> {
    const startTime = this.dependencies.now()
    const { apiType, countryList } = request
    const batch = await this.dependencies.discoverStoreCatalogBatch({
      apiType,
      countryList
    })
    const countryBreakdown: Record<string, StoreCatalogCountryResult> =
      Object.fromEntries(
        Object.entries(batch.requestsByCountry).map(([country, requests]) => [
          country,
          createCountryResult(requests)
        ])
      )

    if (batch.scopes.length === 0) {
      return this.createResult(
        countryBreakdown,
        batch.skippedCountries,
        0,
        0,
        startTime
      )
    }

    const scopeOutcomes = new Map<string, ScopeOutcome>(
      batch.scopes.map((scope) => [
        scope.scope,
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
      const countryResult =
        countryBreakdown[outcome.country] ?? createCountryResult()
      countryBreakdown[outcome.country] = countryResult
      const scopeOutcome = scopeOutcomes.get(outcome.scope)
      if (scopeOutcome == null) {
        throw new Error(
          `Store discovery returned unknown Catalog Scope ${outcome.scope}`
        )
      }

      if (outcome.failure != null) {
        failedRequests++
        countryResult.failed++
        scopeOutcome.failed++
        this.dependencies.logDiscoveryFailure(outcome.failure, {
          apiType,
          country: outcome.country
        })
        continue
      }

      successfulRequests++
      countryResult.successful++
      scopeOutcome.successful++

      for (const store of outcome.stores) {
        scopeOutcome.storesById.set(store.id as string, store)
        if (!storesById.has(store.id as string)) {
          storesById.set(store.id as string, store)
          countryResult.stores++
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
      throw new Error('Store discovery batch did not complete all planned requests')
    }

    return this.createResult(
      countryBreakdown,
      batch.skippedCountries,
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
