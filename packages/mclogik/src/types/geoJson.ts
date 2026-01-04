import { type ItemStatus } from '@mcbroken/db'

export interface CustomItemType {
  name: string
  count: number
  error: number
  status: ItemStatus
}

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
    customItems?: CustomItemType[]
    name: string
    dot: 'RED' | 'YELLOW' | 'GREEN' | 'GREY'
    hasMobileOrdering: boolean
    id: string
  }
  type: 'Feature'
}

export interface GeoJson {
  type: 'FeatureCollection'
  features: GeoJsonPos[]
}
