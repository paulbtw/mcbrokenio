import { type QueryFunction, useQuery } from 'react-query'
import axios from 'axios'

interface McDataProperties {
  hasMilchshake: string
  milkshakeCount: number
  milkshakeErrorCount: number
  hasMcSundae: string
  mcSundaeCount: number
  mcSundaeErrorCount: number
  hasMcFlurry: string
  mcFlurryCount: number
  mcFlurryErrorCount: number
  lastChecked: any
  name: string
  dot: string
  hasMobileOrdering: boolean
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
