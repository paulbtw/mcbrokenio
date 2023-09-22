'use client'

import { useLocation } from '@/hooks/queries/useLocation'
import { useMcData } from '@/hooks/queries/useMcData'
import { Map } from '@/components/Map'

export function MapContainer() {
  const { data: geoJson, isLoading: isLoadingGeoJson } = useMcData()
  const { data: location, isLoading: isLoadingLocation } = useLocation()
  const isLoading = isLoadingGeoJson || isLoadingLocation

  if (isLoading) {
    return <div className="w-full h-full bg-slate-300" />
  }
  return <Map geoJson={geoJson} location={{
    lat: location?.lat ?? 52.5119151,
    lon: location?.lon ?? 13.3668864
  }}/>
}
