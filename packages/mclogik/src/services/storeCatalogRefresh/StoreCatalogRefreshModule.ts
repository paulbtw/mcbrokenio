import { type RequestLimiter } from '../../constants/RateLimit'
import {
  APIType,
  type CreatePos,
  type ICountryInfos,
  type ILocation,
  type Locations
} from '../../types'
import { createRateLimitedExecutor } from '../../utils/RateLimitedExecutor'

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
  persistStores(stores: CreatePos[]): Promise<number>
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
  stores: CreatePos[]
  error?: unknown
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
        const countryResult = createCountryResult()
        countryResult.requests = 1
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
        const countryResult = createCountryResult()
        countryResult.requests = locations.length
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

    const executor = createRateLimitedExecutor(
      this.dependencies.getRequestLimiter(apiType),
      'StoreCatalogRefreshModule'
    )
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

          return {
            index: discoveryRequest.index,
            country: discoveryRequest.countryInfo.country,
            stores
          }
        } catch (error) {
          this.dependencies.logDiscoveryFailure(error, {
            apiType,
            country: discoveryRequest.countryInfo.country
          })

          return {
            index: discoveryRequest.index,
            country: discoveryRequest.countryInfo.country,
            stores: [],
            error
          }
        }
      }
    )

    outcomes.sort((left, right) => left.index - right.index)
    const storesById = new Map<string, CreatePos>()
    let successfulRequests = 0
    let failedRequests = 0

    for (const outcome of outcomes) {
      const countryResult = countryBreakdown[outcome.country]!

      if (outcome.error != null) {
        failedRequests++
        countryResult.failed++
        continue
      }

      successfulRequests++
      countryResult.successful++

      for (const store of outcome.stores) {
        if (!storesById.has(store.id)) {
          storesById.set(store.id, store)
          countryResult.stores++
        }
      }
    }

    if (successfulRequests === 0 && failedRequests > 0) {
      throw new Error('All store discovery requests failed')
    }

    const stores = Array.from(storesById.values())
    const storesPersisted =
      stores.length > 0 ? await this.dependencies.persistStores(stores) : 0

    return this.createResult(
      countryBreakdown,
      skippedCountries,
      stores.length,
      storesPersisted,
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
