import { ItemStatus, type Pos } from '@mcbroken/db'

import {
  type CustomItemType,
  type GeoJson,
  type GeoJsonPos
} from '../../types/geoJson'

export type { CustomItemType, GeoJson, GeoJsonPos } from '../../types/geoJson'

const unknown = ItemStatus.UNKNOWN
const available: ItemStatus[] = [
  ItemStatus.AVAILABLE,
  ItemStatus.NOT_APPLICABLE
]
const unavailable: ItemStatus[] = [
  ItemStatus.UNAVAILABLE,
  ItemStatus.NOT_APPLICABLE
]

export type GeoJsonSourcePos = Pick<
  Pos,
  | 'id'
  | 'name'
  | 'latitude'
  | 'longitude'
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

function getColorDot(
  hasMcFlurry: ItemStatus,
  hasMcSundae: ItemStatus,
  hasMilkshake: ItemStatus,
  isResponsive: boolean
) {
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

/**
 * Converts Store Catalog records into the public availability GeoJSON format.
 *
 * @param allPos - Stores to include in the published marker collection
 * @returns The public GeoJSON feature collection
 */
export function createGeoJson(allPos: GeoJsonSourcePos[]): GeoJson {
  const features = allPos.map<GeoJsonPos>((pos) => ({
    geometry: {
      coordinates: [Number(pos.longitude), Number(pos.latitude), 0],
      type: 'Point'
    },
    properties: {
      hasMilchshake: pos.milkshakeStatus,
      milkshakeCount: pos.milkshakeCount,
      milkshakeErrorCount: pos.milkshakeError,
      hasMcSundae: pos.mcSundaeStatus,
      mcSundaeCount: pos.mcSundaeCount,
      mcSundaeErrorCount: pos.mcSundaeError,
      hasMcFlurry: pos.mcFlurryStatus,
      mcFlurryCount: pos.mcFlurryCount,
      mcFlurryErrorCount: pos.mcFlurryError,
      lastChecked:
        pos.lastChecked != null ? new Date(pos.lastChecked).getTime() : null,
      customItems: pos.customItems as unknown as CustomItemType[],
      name: pos.name,
      dot: getColorDot(
        pos.mcFlurryStatus,
        pos.mcSundaeStatus,
        pos.milkshakeStatus,
        pos.isResponsive
      ),
      hasMobileOrdering: pos.hasMobileOrdering,
      isResponsive: pos.isResponsive,
      id: pos.id
    },
    type: 'Feature'
  }))

  return {
    type: 'FeatureCollection',
    features
  }
}
