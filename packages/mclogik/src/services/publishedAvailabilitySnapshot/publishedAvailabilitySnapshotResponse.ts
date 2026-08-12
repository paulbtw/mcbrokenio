import {
  type CustomItemType,
  type GeoJson,
  type GeoJsonPos
} from '../../types/geoJson'

import {
  type LegacyPublishedAvailabilityStatistics,
  type PublishedAvailabilitySnapshot,
  type PublishedAvailabilityStatistics
} from './PublishedAvailabilitySnapshotModule'

type JsonRecord = Record<string, unknown>
type ItemStatus = GeoJsonPos['properties']['hasMcFlurry']

const INVALID_SNAPSHOT_MESSAGE =
  'Published availability snapshot response was invalid'
const ITEM_STATUSES = new Set<ItemStatus>([
  'AVAILABLE',
  'PARTIAL_AVAILABLE',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'UNKNOWN'
])
const DOT_COLORS = new Set(['RED', 'YELLOW', 'GREEN', 'GREY'])
const STATISTIC_FIELDS = [
  'total',
  'trackable',
  'availablemilkshakes',
  'totalmilkshakes',
  'availablemcflurry',
  'totalmcflurry',
  'availablemcsundae',
  'totalmcsundae'
] as const

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isItemStatus(value: unknown): value is ItemStatus {
  return typeof value === 'string' && ITEM_STATUSES.has(value as ItemStatus)
}

function isCustomItem(value: unknown): value is CustomItemType {
  if (!isRecord(value)) return false

  return (
    typeof value.name === 'string' &&
    isFiniteNumber(value.count) &&
    isFiniteNumber(value.error) &&
    isItemStatus(value.status)
  )
}

function isMarker(value: unknown): value is GeoJsonPos {
  if (!isRecord(value) || value.type !== 'Feature') return false

  const { geometry, properties } = value
  if (!isRecord(geometry) || !isRecord(properties)) return false
  if (
    geometry.type !== 'Point' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length !== 3 ||
    !geometry.coordinates.every(isFiniteNumber)
  ) {
    return false
  }

  return (
    isItemStatus(properties.hasMilchshake) &&
    isFiniteNumber(properties.milkshakeCount) &&
    isFiniteNumber(properties.milkshakeErrorCount) &&
    isItemStatus(properties.hasMcSundae) &&
    isFiniteNumber(properties.mcSundaeCount) &&
    isFiniteNumber(properties.mcSundaeErrorCount) &&
    isItemStatus(properties.hasMcFlurry) &&
    isFiniteNumber(properties.mcFlurryCount) &&
    isFiniteNumber(properties.mcFlurryErrorCount) &&
    (properties.lastChecked === null ||
      isFiniteNumber(properties.lastChecked)) &&
    Array.isArray(properties.customItems) &&
    properties.customItems.every(isCustomItem) &&
    typeof properties.name === 'string' &&
    typeof properties.dot === 'string' &&
    DOT_COLORS.has(properties.dot) &&
    typeof properties.hasMobileOrdering === 'boolean' &&
    typeof properties.isResponsive === 'boolean' &&
    typeof properties.id === 'string'
  )
}

function requireMarkers(value: unknown): GeoJson {
  if (
    !isRecord(value) ||
    value.type !== 'FeatureCollection' ||
    !Array.isArray(value.features) ||
    !value.features.every(isMarker)
  ) {
    throw new Error(INVALID_SNAPSHOT_MESSAGE)
  }

  return value as unknown as GeoJson
}

function hasStatisticMetrics(value: JsonRecord): boolean {
  return STATISTIC_FIELDS.every((field) => isFiniteNumber(value[field]))
}

function isPublishedStatistics(
  value: unknown
): value is PublishedAvailabilityStatistics {
  return (
    isRecord(value) &&
    typeof value.market === 'string' &&
    hasStatisticMetrics(value)
  )
}

function isLegacyStatistics(
  value: unknown
): value is LegacyPublishedAvailabilityStatistics {
  return (
    isRecord(value) &&
    typeof value.country === 'string' &&
    hasStatisticMetrics(value)
  )
}

function requireArray<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item
): Item[] {
  if (!Array.isArray(value) || !value.every(isItem)) {
    throw new Error(INVALID_SNAPSHOT_MESSAGE)
  }

  return value
}

/** Validates an untrusted canonical Published Availability Snapshot response. */
export function requirePublishedAvailabilitySnapshot(
  value: unknown
): PublishedAvailabilitySnapshot {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 2 ||
    typeof value.publishedAt !== 'string'
  ) {
    throw new Error(INVALID_SNAPSHOT_MESSAGE)
  }

  requireMarkers(value.markers)
  requireArray(value.statistics, isPublishedStatistics)

  return value as unknown as PublishedAvailabilitySnapshot
}

/** Validates untrusted legacy marker compatibility data. */
export function requireLegacyAvailabilityMarkers(value: unknown): GeoJson {
  return requireMarkers(value)
}

/** Validates untrusted legacy statistics compatibility data. */
export function requireLegacyAvailabilityStatistics(
  value: unknown
): LegacyPublishedAvailabilityStatistics[] {
  return requireArray(value, isLegacyStatistics)
}
