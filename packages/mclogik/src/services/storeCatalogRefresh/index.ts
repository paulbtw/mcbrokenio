import { prisma } from '@mcbroken/db/client'
import axios from 'axios'

import { createStoreDiscoveryClient } from '../../clients/StoreDiscoveryClient'
import {
  defaultRequestLimiterAu,
  defaultRequestLimiterEu,
  defaultRequestLimiterUs,
  type RequestLimiter
} from '../../constants/RateLimit'
import { createPosRepository } from '../../repositories'
import { APIType } from '../../types'
import { generateCoordinatesMesh } from '../../utils/generateCoordinatesMesh'
import { getMetaForApi } from '../../utils/getMetaForApi'

import {
  StoreCatalogRefreshModule,
  type StoreCatalogRefreshRequest,
  type StoreCatalogRefreshResult
} from './StoreCatalogRefreshModule'

const URL_DISCOVERY_LIMITER: RequestLimiter = {
  concurrentRequests: 2,
  maxRequestsPerSecond: 4,
  requestsPerLog: 100
}
const EU_DISCOVERY_SPACING_KILOMETERS = 50
const AP_US_DISCOVERY_SPACING_KILOMETERS = 30

interface SanitizedDiscoveryError {
  name: 'AxiosError' | 'Error' | 'UnknownError'
  code?: string
  status?: number
}

function sanitizeDiscoveryError(error: unknown): SanitizedDiscoveryError {
  if (axios.isAxiosError(error)) {
    return {
      name: 'AxiosError',
      ...(typeof error.code === 'string' ? { code: error.code } : {}),
      ...(typeof error.response?.status === 'number'
        ? { status: error.response.status }
        : {})
    }
  }

  return { name: error instanceof Error ? 'Error' : 'UnknownError' }
}

function assertSupportedApiType(apiType: APIType): void {
  if (apiType === APIType.HK || apiType === APIType.UNKNOWN) {
    throw new Error(`Store Catalog refresh is not supported for ${apiType}`)
  }
}

function getRequestLimiter(apiType: APIType): RequestLimiter {
  switch (apiType) {
    case APIType.AP:
      return defaultRequestLimiterAu
    case APIType.EL:
      return URL_DISCOVERY_LIMITER
    case APIType.EU:
      return defaultRequestLimiterEu
    case APIType.US:
      return defaultRequestLimiterUs
    case APIType.HK:
    case APIType.UNKNOWN:
      throw new Error(`Store Catalog refresh is not supported for ${apiType}`)
  }
}

function getLocationIntervalKilometers(apiType: APIType): number {
  switch (apiType) {
    case APIType.EU:
      return EU_DISCOVERY_SPACING_KILOMETERS
    case APIType.AP:
    case APIType.US:
      return AP_US_DISCOVERY_SPACING_KILOMETERS
    case APIType.EL:
    case APIType.HK:
    case APIType.UNKNOWN:
      throw new Error(`Location discovery is not supported for ${apiType}`)
  }
}

const storeDiscoveryClient = createStoreDiscoveryClient()
const posRepository = createPosRepository(prisma)

const storeCatalogRefreshModule = new StoreCatalogRefreshModule({
  async loadRefreshContext(apiType, countryList) {
    assertSupportedApiType(apiType)
    const needsCredentials = apiType !== APIType.EL
    const context = await getMetaForApi(apiType, countryList, needsCredentials)

    if (
      needsCredentials &&
      (typeof context.token !== 'string' || context.token.length === 0)
    ) {
      throw new Error(`Bearer token is missing for ${apiType}`)
    }

    if (
      needsCredentials &&
      (typeof context.clientId !== 'string' || context.clientId.length === 0)
    ) {
      throw new Error(`Client id is missing for ${apiType}`)
    }

    return context
  },
  generateLocationMesh(countryInfo, intervalKilometers) {
    return generateCoordinatesMesh(
      countryInfo.locationLimits!,
      intervalKilometers
    )
  },
  discoverFromLocation: (...args) =>
    storeDiscoveryClient.discoverFromLocation(...args),
  discoverFromUrl: (...args) => storeDiscoveryClient.discoverFromUrl(...args),
  persistStores: (stores) => posRepository.upsertMany(stores),
  getRequestLimiter,
  getLocationIntervalKilometers,
  logDiscoveryFailure(error, context) {
    console.error(
      'Store Catalog discovery request failed',
      context,
      sanitizeDiscoveryError(error)
    )
  },
  now: Date.now
})

/**
 * Refreshes the persisted Store Catalog for a regional API.
 *
 * @param request - Regional API and optional market slices to refresh
 * @returns A summary of discovery requests and persisted stores
 */
export async function refreshStoreCatalog(
  request: StoreCatalogRefreshRequest
): Promise<StoreCatalogRefreshResult> {
  return storeCatalogRefreshModule.refresh(request)
}

export type {
  StoreCatalogCountryResult,
  StoreCatalogRefreshRequest,
  StoreCatalogRefreshResult
} from './StoreCatalogRefreshModule'
