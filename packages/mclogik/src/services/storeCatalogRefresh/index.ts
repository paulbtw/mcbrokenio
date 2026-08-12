import { prisma } from '@mcbroken/db/client'

import { createStoreDiscoveryClient } from '../../clients/StoreDiscoveryClient'
import {
  defaultRequestLimiterAu,
  defaultRequestLimiterEu,
  defaultRequestLimiterUs,
  type RequestLimiter
} from '../../constants/RateLimit'
import {
  getExpectedCatalogScopes,
  selectMarketDefinitions
} from '../../markets/marketDefinitions'
import { createCatalogLifecycleRepository } from '../../repositories'
import { APIType } from '../../types'
import { getCatalogCycleId } from '../../utils/catalogCycle'
import { generateCoordinatesMesh } from '../../utils/generateCoordinatesMesh'
import { getBearerToken } from '../token/getBearerToken'
import { getClientId } from '../token/getClientId'

import { StoreCatalogDiscoveryNetwork } from './storeCatalogDiscoveryNetwork'
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
const catalogLifecycleRepository = createCatalogLifecycleRepository(prisma)

const storeCatalogDiscoveryNetwork = new StoreCatalogDiscoveryNetwork({
  async loadRefreshContext(apiType, catalogScopes) {
    const markets = selectMarketDefinitions(apiType, catalogScopes)
    if (apiType === APIType.EL) {
      return { mode: 'url', markets }
    }

    return {
      mode: 'authenticated-location',
      token: await getBearerToken(apiType),
      clientId: getClientId(apiType),
      markets
    }
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
  getRequestLimiter,
  getLocationIntervalKilometers
})

const storeCatalogRefreshModule = new StoreCatalogRefreshModule({
  discoverStoreCatalogBatch: (input) =>
    storeCatalogDiscoveryNetwork.discoverBatch(input),
  recordScopeRefresh: (input) =>
    catalogLifecycleRepository.recordScopeRefresh(input),
  getExpectedCatalogScopes,
  getCatalogCycleId,
  currentDate: () => new Date(),
  logDiscoveryFailure(failure, context) {
    console.error('Store Catalog discovery request failed', context, failure)
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
  StoreCatalogMarketResult,
  StoreCatalogRefreshRequest,
  StoreCatalogRefreshResult
} from './StoreCatalogRefreshModule'
