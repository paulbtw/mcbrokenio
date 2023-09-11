import { type ItemStatus } from '@prisma/client'

export interface GeoJsonPos {
  geometry: {
    coordinates: [number, number, number]
    type: 'Point'
  }
  properties: {
    hasMilchshake: ItemStatus
    milkshakeCount: number
    milkshakeErrorCount: number
    hasMcSundae: ItemStatus
    mcSundaeCount: number
    mcSundaeErrorCount: number
    hasMcFlurry: ItemStatus
    mcFlurryCount: number
    mcFlurryErrorCount: number
    lastChecked: number | null
    name: string
    dot: 'RED' | 'YELLOW' | 'GREEN' | 'GREY'
    hasMobileOrdering: boolean
  }
  type: 'Feature'
}

export interface GeoJson {
  type: 'FeatureCollection'
  features: GeoJsonPos[]
}
