import { type McDataGeometry, useMcData } from '@/hooks/queries/useMcData'

interface useMcMarkerReturnType {
  geoJson: McDataGeometry | undefined
}

export function useMcMarker(): useMcMarkerReturnType {
  const { data } = useMcData()

  data?.features.forEach((feature) => {
    if (typeof feature.properties.customItems !== 'object') {
      console.log(feature.properties.customItems)
    }
  })

  return {
    geoJson: data
  }
}
