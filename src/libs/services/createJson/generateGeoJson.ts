import { type GeoJson, type GeoJsonPos } from '@libs/types/geoJson'
import { ItemStatus, type Pos } from '@prisma/client'

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
  hasMilchshake: ItemStatus
) {
  if (
    hasMcFlurry === unknown &&
    hasMcSundae === unknown &&
    hasMilchshake === unknown
  ) {
    return 'GREY'
  }
  if (
    available.includes(hasMcFlurry) &&
    available.includes(hasMcSundae) &&
    available.includes(hasMilchshake)
  ) {
    return 'GREEN'
  }
  if (
    unavailable.includes(hasMcFlurry) &&
    unavailable.includes(hasMcSundae) &&
    unavailable.includes(hasMilchshake)
  ) {
    return 'RED'
  }

  return 'YELLOW'
}

export function createGeoJson(allPos: Pos[]): GeoJson {
  const json = allPos.map<GeoJsonPos>((pos) => {
    const dot = getColorDot(
      pos.mcFlurryStatus,
      pos.mcFlurryStatus,
      pos.milkshakeStatus
    )

    return {
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
        lastChecked: pos.lastChecked != null ? new Date(pos.lastChecked).getTime() : null,
        name: pos.name,
        dot,
        hasMobileOrdering: pos.hasMobileOrdering
      },
      type: 'Feature'
    }
  })

  return {
    type: 'FeatureCollection',
    features: json
  }
}
