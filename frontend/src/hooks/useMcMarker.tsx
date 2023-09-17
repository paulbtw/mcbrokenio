import { type McDataGeometry, useMcData } from '@/hooks/queries/useMcData'

interface useMcMarkerReturnType {
  geoJson: McDataGeometry | undefined
}

export function useMcMarker(): useMcMarkerReturnType {
  const { data } = useMcData()

  return {
    geoJson: data
  }
}
