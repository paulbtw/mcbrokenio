import { ItemStatus, type Pos } from '@mcbroken/db'

import {
  type CustomItemType,
  type GeoJson,
  type GeoJsonPos
} from '../../types/geoJson'

export const PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION = 1 as const

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
  filesPublished: ['snapshot.json', 'marker.json', 'stats.json']
  publishedAt: string
  durationMs: number
}

export interface PublishedAvailabilitySnapshot {
  schemaVersion: typeof PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION
  publishedAt: string
  markers: GeoJson
  statistics: PublishedAvailabilityStatistics[]
}

type PublishedAvailabilityStore = Pick<
  Pos,
  | 'id'
  | 'name'
  | 'latitude'
  | 'longitude'
  | 'country'
  | 'milkshakeStatus'
  | 'milkshakeCount'
  | 'milkshakeError'
  | 'mcSundaeStatus'
  | 'mcSundaeCount'
  | 'mcSundaeError'
  | 'mcFlurryStatus'
  | 'mcFlurryCount'
  | 'mcFlurryError'
  | 'lastChecked'
  | 'customItems'
  | 'hasMobileOrdering'
  | 'isResponsive'
>

export interface PublishedAvailabilitySnapshotDependencies {
  loadStores(): Promise<PublishedAvailabilityStore[]>
  publishJson(key: string, value: unknown): Promise<void>
  currentDate(): Date
  now(): number
}

const unknown = ItemStatus.UNKNOWN
const available: ItemStatus[] = [
  ItemStatus.AVAILABLE,
  ItemStatus.NOT_APPLICABLE
]
const unavailable: ItemStatus[] = [
  ItemStatus.UNAVAILABLE,
  ItemStatus.NOT_APPLICABLE
]

function getColorDot(
  hasMcFlurry: ItemStatus,
  hasMcSundae: ItemStatus,
  hasMilkshake: ItemStatus,
  isResponsive: boolean
): GeoJsonPos['properties']['dot'] {
  if (!isResponsive) {
    return 'GREY'
  }

  if (
    hasMcFlurry === unknown &&
    hasMcSundae === unknown &&
    hasMilkshake === unknown
  ) {
    return 'GREY'
  }
  if (
    available.includes(hasMcFlurry) &&
    available.includes(hasMcSundae) &&
    available.includes(hasMilkshake)
  ) {
    return 'GREEN'
  }
  if (
    unavailable.includes(hasMcFlurry) &&
    unavailable.includes(hasMcSundae) &&
    unavailable.includes(hasMilkshake)
  ) {
    return 'RED'
  }

  return 'YELLOW'
}

function createGeoJson(stores: PublishedAvailabilityStore[]): GeoJson {
  const features = stores.map<GeoJsonPos>((store) => ({
    geometry: {
      coordinates: [
        Number(store.longitude),
        Number(store.latitude),
        0
      ],
      type: 'Point'
    },
    properties: {
      hasMilchshake: store.milkshakeStatus,
      milkshakeCount: store.milkshakeCount,
      milkshakeErrorCount: store.milkshakeError,
      hasMcSundae: store.mcSundaeStatus,
      mcSundaeCount: store.mcSundaeCount,
      mcSundaeErrorCount: store.mcSundaeError,
      hasMcFlurry: store.mcFlurryStatus,
      mcFlurryCount: store.mcFlurryCount,
      mcFlurryErrorCount: store.mcFlurryError,
      lastChecked:
        store.lastChecked != null
          ? new Date(store.lastChecked).getTime()
          : null,
      customItems: store.customItems as unknown as CustomItemType[],
      name: store.name,
      dot: getColorDot(
        store.mcFlurryStatus,
        store.mcSundaeStatus,
        store.milkshakeStatus,
        store.isResponsive
      ),
      hasMobileOrdering: store.hasMobileOrdering,
      isResponsive: store.isResponsive,
      id: store.id
    },
    type: 'Feature'
  }))

  return {
    type: 'FeatureCollection',
    features
  }
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
    const publishedAt = this.dependencies.currentDate().toISOString()
    const snapshot: PublishedAvailabilitySnapshot = {
      schemaVersion: PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
      publishedAt,
      markers,
      statistics
    }

    await this.dependencies.publishJson('snapshot.json', snapshot)
    await this.dependencies.publishJson('marker.json', markers)
    await this.dependencies.publishJson('stats.json', statistics)

    return {
      storesPublished: stores.length,
      statisticsRowsPublished: statistics.length,
      filesPublished: ['snapshot.json', 'marker.json', 'stats.json'],
      publishedAt,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
