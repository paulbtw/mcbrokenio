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
): void {
  statistics.total++

  if (store.hasMobileOrdering && store.isResponsive) {
    statistics.trackable++
  }

  if (!store.isResponsive) {
    return
  }

  if (store.milkshakeStatus === ItemStatus.AVAILABLE) {
    statistics.availablemilkshakes++
  }
  if (isTrackedStatus(store.milkshakeStatus)) {
    statistics.totalmilkshakes++
  }

  if (store.mcFlurryStatus === ItemStatus.AVAILABLE) {
    statistics.availablemcflurry++
  }
  if (isTrackedStatus(store.mcFlurryStatus)) {
    statistics.totalmcflurry++
  }

  if (store.mcSundaeStatus === ItemStatus.AVAILABLE) {
    statistics.availablemcsundae++
  }
  if (isTrackedStatus(store.mcSundaeStatus)) {
    statistics.totalmcsundae++
  }
}

function createPublishedStatistics(
  stores: PublishedAvailabilityStore[]
): PublishedAvailabilityStatistics[] {
  const statisticsByCountry = new Map<
    string,
    PublishedAvailabilityStatistics
  >()
  const aggregate = createStatisticsRow('UNKNOWN')

  for (const store of stores) {
    const countryStatistics =
      statisticsByCountry.get(store.country) ??
      createStatisticsRow(store.country)
    statisticsByCountry.set(store.country, countryStatistics)
    addStoreToStatistics(countryStatistics, store)
    addStoreToStatistics(aggregate, store)
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
