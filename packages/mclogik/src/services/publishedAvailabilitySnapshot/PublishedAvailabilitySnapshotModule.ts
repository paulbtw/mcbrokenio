import { ItemStatus, type Pos } from '@mcbroken/db'

import { createGeoJson, type GeoJsonSourcePos } from './createGeoJson'

export interface PublishedAvailabilityStatistics {
  total: number
  trackable: number
  availablemilkshakes: number
  totalmilkshakes: number
  availablemcflurry: number
  totalmcflurry: number
  availablemcsundae: number
  totalmcsundae: number
  country: string
}

export interface PublishAvailabilitySnapshotResult {
  storesPublished: number
  statisticsRowsPublished: number
  filesPublished: ['marker.json', 'stats.json']
  durationMs: number
}

type PublishedAvailabilityStore = GeoJsonSourcePos & Pick<Pos, 'country'>

export interface PublishedAvailabilitySnapshotDependencies {
  loadStores(): Promise<PublishedAvailabilityStore[]>
  publishJson(key: string, value: unknown): Promise<void>
  now(): number
}

function createStatisticsRow(country: string): PublishedAvailabilityStatistics {
  return {
    total: 0,
    trackable: 0,
    availablemilkshakes: 0,
    totalmilkshakes: 0,
    availablemcflurry: 0,
    totalmcflurry: 0,
    availablemcsundae: 0,
    totalmcsundae: 0,
    country
  }
}

function isTrackedStatus(status: ItemStatus): boolean {
  return status !== ItemStatus.UNKNOWN && status !== ItemStatus.NOT_APPLICABLE
}

function addStoreToStatistics(
  statistics: PublishedAvailabilityStatistics,
  store: PublishedAvailabilityStore
): PublishedAvailabilityStatistics {
  return {
    ...statistics,
    total: statistics.total + 1,
    trackable:
      statistics.trackable +
      (store.hasMobileOrdering && store.isResponsive ? 1 : 0),
    availablemilkshakes:
      statistics.availablemilkshakes +
      (store.isResponsive && store.milkshakeStatus === ItemStatus.AVAILABLE
        ? 1
        : 0),
    totalmilkshakes:
      statistics.totalmilkshakes +
      (store.isResponsive && isTrackedStatus(store.milkshakeStatus) ? 1 : 0),
    availablemcflurry:
      statistics.availablemcflurry +
      (store.isResponsive && store.mcFlurryStatus === ItemStatus.AVAILABLE
        ? 1
        : 0),
    totalmcflurry:
      statistics.totalmcflurry +
      (store.isResponsive && isTrackedStatus(store.mcFlurryStatus) ? 1 : 0),
    availablemcsundae:
      statistics.availablemcsundae +
      (store.isResponsive && store.mcSundaeStatus === ItemStatus.AVAILABLE
        ? 1
        : 0),
    totalmcsundae:
      statistics.totalmcsundae +
      (store.isResponsive && isTrackedStatus(store.mcSundaeStatus) ? 1 : 0)
  }
}

function createPublishedStatistics(
  stores: PublishedAvailabilityStore[]
): PublishedAvailabilityStatistics[] {
  const statisticsByCountry = new Map<
    string,
    PublishedAvailabilityStatistics
  >()
  let aggregate = createStatisticsRow('UNKNOWN')

  for (const store of stores) {
    const countryStatistics = addStoreToStatistics(
      statisticsByCountry.get(store.country) ??
        createStatisticsRow(store.country),
      store
    )
    statisticsByCountry.set(store.country, countryStatistics)
    aggregate = addStoreToStatistics(aggregate, store)
  }

  return [...statisticsByCountry.values(), aggregate]
}

export class PublishedAvailabilitySnapshotModule {
  constructor(
    private readonly dependencies: PublishedAvailabilitySnapshotDependencies
  ) {}

  async publish(): Promise<PublishAvailabilitySnapshotResult> {
    const startTime = this.dependencies.now()
    const stores = await this.dependencies.loadStores()
    const markers = createGeoJson(stores)
    const statistics = createPublishedStatistics(stores)

    await Promise.all([
      this.dependencies.publishJson('marker.json', markers),
      this.dependencies.publishJson('stats.json', statistics)
    ])

    return {
      storesPublished: stores.length,
      statisticsRowsPublished: statistics.length,
      filesPublished: ['marker.json', 'stats.json'],
      durationMs: this.dependencies.now() - startTime
    }
  }
}
