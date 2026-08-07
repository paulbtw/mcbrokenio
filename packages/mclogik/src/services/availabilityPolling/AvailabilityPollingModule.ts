import { type Pos } from '@mcbroken/db'
import axios from 'axios'

import { type StoreProductAvailability } from '../../clients/ProductAvailability'
import { type RequestLimiter } from '../../constants/RateLimit'
import { type BatchFailureSample, type BatchSummary } from '../../sentry'
import {
  type APIType,
  type ICountryInfos,
  type Locations,
  type UpdatePos
} from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

const ERROR_THRESHOLD = 3
const MAX_FAILURE_SAMPLES = 5

type JsonRecord = Record<string, unknown>

export interface AvailabilityPollRequest {
  apiType: APIType
  countryList?: Locations[]
}

export interface AvailabilityPollCountryResult {
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
  countryBreakdown: Record<string, AvailabilityPollCountryResult>
  durationMs: number
}

interface AvailabilityPollContext {
  token: string
  clientId: string
  countryInfos: ICountryInfos[]
}

interface ProductAvailabilityAdapter {
  fetchStoreProductAvailability(
    pos: Pos,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<StoreProductAvailability>
}

export interface AvailabilityPollingDependencies {
  loadPollContext(
    apiType: APIType,
    countryList?: Locations[]
  ): Promise<AvailabilityPollContext>
  findEligibleStores(countries: string[]): Promise<Pos[]>
  createProductAvailabilityAdapter(apiType: APIType): ProductAvailabilityAdapter
  persistUpdates(updates: UpdatePos[]): Promise<void>
  getRequestLimiter(apiType: APIType): RequestLimiter
  addBreadcrumb(
    message: string,
    data?: Record<string, string | number | boolean>
  ): void
  captureBatchSummary(summary: BatchSummary): void
  logStoreFailure(sample: BatchFailureSample): void
  now(): number
}

function getStringValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return undefined
}

function getRecordValue(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}

function createFailureSignature(
  sample: Omit<BatchFailureSample, 'signature'>
): string {
  return [
    sample.apiType,
    sample.country,
    sample.httpStatus ?? 'unknown',
    sample.responseCode ?? 'unknown',
    sample.responseType ?? sample.errorName,
    sample.responseMessage ?? sample.errorMessage
  ].join('|')
}

function createBatchFailureSample(
  error: unknown,
  apiType: APIType,
  pos: Pos
): BatchFailureSample {
  const baseSample = {
    apiType,
    country: pos.country,
    storeId: pos.id,
    nationalStoreNumber: pos.nationalStoreNumber
  }

  if (axios.isAxiosError(error)) {
    const responseData = getRecordValue(error.response?.data)
    const statusData = getRecordValue(responseData?.status)
    const responseErrors = Array.isArray(statusData?.errors)
      ? statusData.errors
          .slice(0, 3)
          .map((item) => getRecordValue(item))
          .filter((item): item is JsonRecord => item != null)
          .map((item) => ({
            code: getStringValue(item.code),
            type: getStringValue(item.type),
            message: getStringValue(item.message),
            property: getStringValue(item.property),
            service: getStringValue(item.service)
          }))
      : undefined

    const sample: Omit<BatchFailureSample, 'signature'> = {
      ...baseSample,
      errorName: error.name,
      errorMessage: error.message,
      requestUrl: error.config?.url,
      httpStatus: error.response?.status,
      responseCode: getStringValue(statusData?.code),
      responseType: getStringValue(statusData?.type),
      responseMessage:
        getStringValue(statusData?.message) ??
        getStringValue(responseData?.message),
      responseService: getStringValue(statusData?.service),
      responseErrors
    }

    return {
      ...sample,
      signature: createFailureSignature(sample)
    }
  }

  const sample: Omit<BatchFailureSample, 'signature'> = {
    ...baseSample,
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage:
      error instanceof Error
        ? error.message
        : 'Product availability request failed'
  }

  return {
    ...sample,
    signature: createFailureSignature(sample)
  }
}

function createSuccessfulUpdate(
  pos: Pos,
  productAvailability: StoreProductAvailability
): UpdatePos {
  const { milkshake, mcFlurry, mcSundae, custom } = productAvailability

  return {
    id: pos.id,
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

function createFailedUpdate(pos: Pos): UpdatePos {
  const errorCounter = pos.errorCounter + 1

  return {
    id: pos.id,
    errorCounter,
    isResponsive: errorCounter < ERROR_THRESHOLD
  }
}

function createCountryResult(): AvailabilityPollCountryResult {
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
    const { apiType, countryList } = request
    const { token, clientId, countryInfos } =
      await this.dependencies.loadPollContext(apiType, countryList)
    const countries = countryInfos.map((countryInfo) => countryInfo.country)
    const countryInfosByCountry = new Map(
      countryInfos.map((countryInfo) => [countryInfo.country, countryInfo])
    )
    const stores = await this.dependencies.findEligibleStores(countries)

    this.dependencies.addBreadcrumb('Starting availability poll', {
      apiType,
      storeCount: stores.length
    })

    if (stores.length === 0) {
      return this.createResult({}, startTime)
    }

    const countryBreakdown: Record<string, AvailabilityPollCountryResult> = {}
    const storesWithConfig: Array<{ pos: Pos; countryInfo: ICountryInfos }> = []

    for (const pos of stores) {
      const countryResult =
        countryBreakdown[pos.country] ?? createCountryResult()
      countryResult.total++
      countryBreakdown[pos.country] = countryResult

      const countryInfo = countryInfosByCountry.get(pos.country as Locations)
      if (countryInfo == null) {
        countryResult.skipped++
        continue
      }

      storesWithConfig.push({ pos, countryInfo })
    }

    const productAvailabilityAdapter =
      this.dependencies.createProductAvailabilityAdapter(apiType)
    const executor = createRateLimitedExecutor(
      this.dependencies.getRequestLimiter(apiType),
      'AvailabilityPollingModule'
    )
    const samplesBySignature = new Map<string, BatchFailureSample>()

    const { results: updates } = await executor.executeAll(
      storesWithConfig,
      async ({ pos, countryInfo }) => {
        const countryResult = countryBreakdown[pos.country]!

        try {
          const productAvailability =
            await productAvailabilityAdapter.fetchStoreProductAvailability(
              pos,
              countryInfo,
              token,
              clientId
            )

          if (productAvailability == null) {
            throw new Error('Product availability request returned null')
          }

          const update = createSuccessfulUpdate(pos, productAvailability)
          countryResult.success++
          return update
        } catch (error) {
          countryResult.failed++
          const sample = createBatchFailureSample(error, apiType, pos)

          if (
            !samplesBySignature.has(sample.signature) &&
            samplesBySignature.size < MAX_FAILURE_SAMPLES
          ) {
            samplesBySignature.set(sample.signature, sample)
            this.dependencies.logStoreFailure(sample)
          }

          return createFailedUpdate(pos)
        }
      }
    )

    if (updates.length > 0) {
      await this.dependencies.persistUpdates(updates)
    }

    const result = this.createResult(countryBreakdown, startTime)
    this.dependencies.captureBatchSummary({
      apiType,
      totalStores: result.totalStores,
      successCount: result.successCount,
      failedCount: result.failedCount,
      countryBreakdown: Object.fromEntries(
        Object.entries(countryBreakdown).map(([country, stats]) => [
          country,
          { total: stats.total, failed: stats.failed }
        ])
      ),
      durationMs: result.durationMs,
      sampleErrors: Array.from(samplesBySignature.values())
    })

    return result
  }

  private createResult(
    countryBreakdown: Record<string, AvailabilityPollCountryResult>,
    startTime: number
  ): AvailabilityPollResult {
    const countryResults = Object.values(countryBreakdown)

    return {
      totalStores: countryResults.reduce((sum, stats) => sum + stats.total, 0),
      successCount: countryResults.reduce(
        (sum, stats) => sum + stats.success,
        0
      ),
      failedCount: countryResults.reduce((sum, stats) => sum + stats.failed, 0),
      skippedCount: countryResults.reduce(
        (sum, stats) => sum + stats.skipped,
        0
      ),
      countryBreakdown,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
