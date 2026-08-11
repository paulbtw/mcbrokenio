import { type Pos } from '@mcbroken/db'

import { type StoreProductAvailability } from '../../clients/ProductAvailability'
import { type BatchFailureSample, type BatchSummary } from '../../sentry'
import { type APIType, type Locations, type UpdatePos } from '../../types'

import { type ProductAvailabilityBatchOutcome } from './productAvailabilityNetwork'

const ERROR_THRESHOLD = 3
const MAX_FAILURE_SAMPLES = 5

export interface AvailabilityPollRequest {
  apiType: APIType
  catalogScopes?: Locations[]
  /** @deprecated Use `catalogScopes`. Retained at the Lambda input boundary. */
  countryList?: Locations[]
}

export interface AvailabilityPollMarketResult {
  total: number
  success: number
  failed: number
  skipped: number
}

export interface AvailabilityPollResult {
  totalStores: number
  successCount: number
  failedCount: number
  skippedCount: number
  marketBreakdown: Record<string, AvailabilityPollMarketResult>
  durationMs: number
}

export interface AvailabilityPollingDependencies {
  getMarketCodes(apiType: APIType, catalogScopes?: Locations[]): string[]
  findEligibleStores(marketCodes: string[]): Promise<AvailabilityPollStore[]>
  fetchProductAvailabilityBatch(input: {
    apiType: APIType
    catalogScopes?: Locations[]
    stores: AvailabilityPollStore[]
  }): Promise<ProductAvailabilityBatchOutcome[]>
  persistUpdates(updates: UpdatePos[]): Promise<void>
  addBreadcrumb(
    message: string,
    data?: Record<string, string | number | boolean>
  ): void
  captureBatchSummary(summary: BatchSummary): void
  logStoreFailure(sample: BatchFailureSample): void
  now(): number
}

type AvailabilityPollStore = Pick<
  Pos,
  'id' | 'nationalStoreNumber' | 'country' | 'errorCounter'
>

function createFailureSignature(
  apiType: APIType,
  marketCode: string,
  failure: ProductAvailabilityBatchOutcome & { outcome: 'failure' }
): string {
  const { kind, retryable, status, code, type, service, message } =
    failure.failure

  return [
    apiType,
    marketCode,
    kind,
    retryable,
    status ?? 'unknown',
    code ?? 'unknown',
    type ?? 'unknown',
    service ?? 'unknown',
    message
  ].join('|')
}

function createBatchFailureSample(
  apiType: APIType,
  outcome: ProductAvailabilityBatchOutcome & { outcome: 'failure' }
): BatchFailureSample {
  const { store, failure } = outcome

  return {
    signature: createFailureSignature(apiType, store.country, outcome),
    apiType,
    country: store.country,
    storeId: store.id,
    nationalStoreNumber: store.nationalStoreNumber,
    ...failure
  }
}

function createSuccessfulUpdate(
  store: AvailabilityPollStore,
  productAvailability: StoreProductAvailability
): UpdatePos {
  const { milkshake, mcFlurry, mcSundae, custom } = productAvailability

  return {
    id: store.id,
    milkshakeCount: milkshake.count,
    milkshakeError: milkshake.unavailable,
    milkshakeStatus: milkshake.status,
    mcFlurryCount: mcFlurry.count,
    mcFlurryError: mcFlurry.unavailable,
    mcFlurryStatus: mcFlurry.status,
    mcSundaeCount: mcSundae.count,
    mcSundaeError: mcSundae.unavailable,
    mcSundaeStatus: mcSundae.status,
    customItems: custom.map((item) => ({
      name: item.name,
      count: item.count,
      error: item.unavailable,
      status: item.status
    })),
    errorCounter: 0,
    isResponsive: true
  }
}

function createFailedUpdate(store: AvailabilityPollStore): UpdatePos {
  const errorCounter = store.errorCounter + 1

  return {
    id: store.id,
    errorCounter,
    isResponsive: errorCounter < ERROR_THRESHOLD
  }
}

function createMarketResult(): AvailabilityPollMarketResult {
  return {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0
  }
}

export class AvailabilityPollingModule {
  constructor(private readonly dependencies: AvailabilityPollingDependencies) {}

  async poll(
    request: AvailabilityPollRequest
  ): Promise<AvailabilityPollResult> {
    const startTime = this.dependencies.now()
    const { apiType } = request
    const catalogScopes = request.catalogScopes ?? request.countryList
    const marketCodes = this.dependencies.getMarketCodes(apiType, catalogScopes)
    const stores = await this.dependencies.findEligibleStores(marketCodes)

    this.dependencies.addBreadcrumb('Starting availability poll', {
      apiType,
      storeCount: stores.length
    })

    if (stores.length === 0) {
      return this.createResult({}, startTime)
    }

    const marketBreakdown: Record<string, AvailabilityPollMarketResult> = {}
    for (const store of stores) {
      const marketResult =
        marketBreakdown[store.country] ?? createMarketResult()
      marketResult.total++
      marketBreakdown[store.country] = marketResult
    }

    const outcomes = await this.dependencies.fetchProductAvailabilityBatch({
      apiType,
      catalogScopes,
      stores
    })
    if (outcomes.length !== stores.length) {
      throw new Error('Product availability batch returned incomplete outcomes')
    }

    const updates: UpdatePos[] = []
    const samplesBySignature = new Map<string, BatchFailureSample>()

    for (const outcome of outcomes) {
      const marketResult = marketBreakdown[outcome.store.country]
      if (marketResult == null) {
        throw new Error(
          `Product availability batch returned unknown store ${outcome.store.id}`
        )
      }

      switch (outcome.outcome) {
        case 'success':
          marketResult.success++
          updates.push(
            createSuccessfulUpdate(outcome.store, outcome.availability)
          )
          break
        case 'failure': {
          marketResult.failed++
          updates.push(createFailedUpdate(outcome.store))
          const sample = createBatchFailureSample(apiType, outcome)

          if (
            !samplesBySignature.has(sample.signature) &&
            samplesBySignature.size < MAX_FAILURE_SAMPLES
          ) {
            samplesBySignature.set(sample.signature, sample)
            this.dependencies.logStoreFailure(sample)
          }
          break
        }
        case 'skipped':
          marketResult.skipped++
          break
      }
    }

    if (updates.length > 0) {
      await this.dependencies.persistUpdates(updates)
    }

    const result = this.createResult(marketBreakdown, startTime)
    this.dependencies.captureBatchSummary({
      apiType,
      totalStores: result.totalStores,
      successCount: result.successCount,
      failedCount: result.failedCount,
      countryBreakdown: Object.fromEntries(
        Object.entries(marketBreakdown).map(([marketCode, stats]) => [
          marketCode,
          { total: stats.total, failed: stats.failed }
        ])
      ),
      durationMs: result.durationMs,
      sampleErrors: Array.from(samplesBySignature.values())
    })

    return result
  }

  private createResult(
    marketBreakdown: Record<string, AvailabilityPollMarketResult>,
    startTime: number
  ): AvailabilityPollResult {
    const marketResults = Object.values(marketBreakdown)

    return {
      totalStores: marketResults.reduce((sum, stats) => sum + stats.total, 0),
      successCount: marketResults.reduce(
        (sum, stats) => sum + stats.success,
        0
      ),
      failedCount: marketResults.reduce((sum, stats) => sum + stats.failed, 0),
      skippedCount: marketResults.reduce(
        (sum, stats) => sum + stats.skipped,
        0
      ),
      marketBreakdown,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
