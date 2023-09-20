import { type QueryFunction, useQuery } from 'react-query'
import axios from 'axios'
import { type ItemStatus } from '@/types'

export interface McDataProperties {
  hasMilchshake: ItemStatus
  milkshakeCount: number
  milkshakeErrorCount: number
  hasMcSundae: ItemStatus
  mcSundaeCount: number
  mcSundaeErrorCount: number
  hasMcFlurry: ItemStatus
  mcFlurryCount: number
  mcFlurryErrorCount: number
  customItems: Record<number, {
    name: string
    count: number
    error: number
    status: ItemStatus
  }>
  lastChecked: string | null
  name: string
  dot: string
  hasMobileOrdering: boolean
  id: string
}

export type McDataGeometry = GeoJSON.FeatureCollection<
GeoJSON.Point,
McDataProperties
>

const fetchMcData: QueryFunction<McDataGeometry> = async ({ signal }) => {
  const { data } = await axios.get<McDataGeometry>('/assets/marker.json', {
    signal
  })

  return data
}

export const useMcData = () => {
  return useQuery({
    queryKey: 'mcData',
    queryFn: fetchMcData
  })
}
