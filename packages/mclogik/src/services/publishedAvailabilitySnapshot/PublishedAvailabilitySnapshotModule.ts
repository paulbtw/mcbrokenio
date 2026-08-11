import { ItemStatus, type Pos } from '@mcbroken/db'

import { asMarketCode, type MarketCode } from '../../types'
import {
  type CustomItemType,
  type GeoJson,
  type GeoJsonPos
} from '../../types/geoJson'

export const PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION = 2 as const

export interface PublishedAvailabilityStatistics {
  total: number
  trackable: number
  availablemilkshakes: number
  totalmilkshakes: number
  availablemcflurry: number
  totalmcflurry: number
  availablemcsundae: number
  totalmcsundae: number
  market: MarketCode
}

export interface LegacyPublishedAvailabilityStatistics {
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
  schemaVersion: typeof PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION
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

const UNKNOWN_ITEM_STATUS = ItemStatus.UNKNOWN
const GREEN_ITEM_STATUSES: ItemStatus[] = [
  ItemStatus.AVAILABLE,
  ItemStatus.NOT_APPLICABLE
]
const RED_ITEM_STATUSES: ItemStatus[] = [
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
    hasMcFlurry === UNKNOWN_ITEM_STATUS &&
    hasMcSundae === UNKNOWN_ITEM_STATUS &&
    hasMilkshake === UNKNOWN_ITEM_STATUS
  ) {
    return 'GREY'
  }
  if (
    GREEN_ITEM_STATUSES.includes(hasMcFlurry) &&
    GREEN_ITEM_STATUSES.includes(hasMcSundae) &&
    GREEN_ITEM_STATUSES.includes(hasMilkshake)
  ) {
    return 'GREEN'
  }
  if (
    RED_ITEM_STATUSES.includes(hasMcFlurry) &&
    RED_ITEM_STATUSES.includes(hasMcSundae) &&
    RED_ITEM_STATUSES.includes(hasMilkshake)
  ) {
    return 'RED'
  }

  return 'YELLOW'
}

function createGeoJson(stores: PublishedAvailabilityStore[]): GeoJson {
  const features = stores.map<GeoJsonPos>((store) => ({
    geometry: {
      coordinates: [Number(store.longitude), Number(store.latitude), 0],
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

function createStatisticsRow(
  market: MarketCode
): PublishedAvailabilityStatistics {
  return {
    total: 0,
    trackable: 0,
    availablemilkshakes: 0,
    totalmilkshakes: 0,
    availablemcflurry: 0,
    totalmcflurry: 0,
    availablemcsundae: 0,
    totalmcsundae: 0,
    market
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
  const statisticsByMarket = new Map<
    MarketCode,
    PublishedAvailabilityStatistics
  >()
  let aggregate = createStatisticsRow(asMarketCode('UNKNOWN'))

  for (const store of stores) {
    const market = asMarketCode(store.country)
    const marketStatistics = addStoreToStatistics(
      statisticsByMarket.get(market) ?? createStatisticsRow(market),
      store
    )
    statisticsByMarket.set(market, marketStatistics)
    aggregate = addStoreToStatistics(aggregate, store)
  }

  return [...statisticsByMarket.values(), aggregate]
}

/** Converts legacy stats.json rows into the canonical Market-based contract. */
export function convertLegacyPublishedAvailabilityStatistics(
  statistics: LegacyPublishedAvailabilityStatistics[]
): PublishedAvailabilityStatistics[] {
  return statistics.map(({ country, ...metrics }) => ({
    ...metrics,
    market: asMarketCode(country)
  }))
}

function createLegacyPublishedAvailabilityStatistics(
  statistics: PublishedAvailabilityStatistics[]
): LegacyPublishedAvailabilityStatistics[] {
  return statistics.map(({ market, ...metrics }) => ({
    ...metrics,
    country: market
  }))
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
    await this.dependencies.publishJson(
      'stats.json',
      createLegacyPublishedAvailabilityStatistics(statistics)
    )

    return {
      storesPublished: stores.length,
      statisticsRowsPublished: statistics.length,
      filesPublished: ['snapshot.json', 'marker.json', 'stats.json'],
      schemaVersion: PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
      publishedAt,
      durationMs: this.dependencies.now() - startTime
    }
  }
}
