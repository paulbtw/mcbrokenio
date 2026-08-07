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
  addBreadcrumb,
  type BatchFailureSample,
  captureBatchSummary
} from '../../sentry'
import { APIType, type UpdatePos } from '../../types'
import { getMetaForApi } from '../../utils/getMetaForApi'
import { getPosByCountries } from '../../utils/getPosByCountries'

import {
  AvailabilityPollingModule,
  type AvailabilityPollRequest,
  type AvailabilityPollResult
} from './AvailabilityPollingModule'

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

async function persistUpdates(updates: UpdatePos[]): Promise<void> {
  const now = new Date()

  await prisma.$transaction(
    updates.map((update) => {
      if (typeof update.id !== 'string') {
        throw new Error('Availability update is missing a store id')
      }

      return prisma.pos.update({
        where: { id: update.id },
        data: {
          mcFlurryCount: update.mcFlurryCount,
          mcFlurryError: update.mcFlurryError,
          mcFlurryStatus: update.mcFlurryStatus,
          mcSundaeCount: update.mcSundaeCount,
          mcSundaeError: update.mcSundaeError,
          mcSundaeStatus: update.mcSundaeStatus,
          milkshakeCount: update.milkshakeCount,
          milkshakeError: update.milkshakeError,
          milkshakeStatus: update.milkshakeStatus,
          customItems: update.customItems,
          errorCounter: update.errorCounter,
          isResponsive: update.isResponsive,
          lastChecked: now,
          updatedAt: now
        }
      })
    })
  )
}

function logStoreFailure(sample: BatchFailureSample): void {
  console.error('Product availability request failed', sample)
}

const availabilityPollingModule = new AvailabilityPollingModule({
  async loadPollContext(apiType, countryList) {
    const context = await getMetaForApi(apiType, countryList, true)

    if (typeof context.token !== 'string' || context.token.length === 0) {
      throw new Error(`Bearer token is missing for ${apiType}`)
    }

    return context
  },
  findEligibleStores: async (countries) => getPosByCountries(prisma, countries),
  createProductAvailabilityAdapter(apiType) {
    const productAvailabilityFetcher = createStoreProductAvailabilityFetcher(
      createApiClient(apiType)
    )

    return {
      fetchStoreProductAvailability: (...args) =>
        productAvailabilityFetcher.fetchStoreProductAvailability(...args)
    }
  },
  persistUpdates,
  getRequestLimiter,
  addBreadcrumb,
  captureBatchSummary,
  logStoreFailure,
  now: Date.now
})

export async function pollAvailability(
  request: AvailabilityPollRequest
): Promise<AvailabilityPollResult> {
  return availabilityPollingModule.poll(request)
}

export type {
  AvailabilityPollCountryResult,
  AvailabilityPollRequest,
  AvailabilityPollResult
} from './AvailabilityPollingModule'
