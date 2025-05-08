'use client'

import { LocationList } from '@/components/LocationList'
import { MapComponent } from '@/components/MapComponent'
import { type McDataProperties } from '@/hooks/queries/useMcData'
import { useMapInteractions } from '@/hooks/useMapInteractions'
import { useState } from 'react'

interface DesktopViewProps {
  geo: {
    lat: number
    lon: number
  }
}

export function DesktopView({ geo }: DesktopViewProps) {
  const [hoveredItem, setHoveredItem] = useState<GeoJSON.Feature<GeoJSON.Point, McDataProperties> | null>(null)
  const {
    mapRef,
    geoJson,
    isLoadingGeoJson,
    viewState,
    setViewState,
    debouncedViewState,
    panToLocation
  } = useMapInteractions({ geo })
  console.log(hoveredItem)
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <MapComponent
          geoJson={geoJson}
          viewState={viewState}
          setViewState={setViewState}
          isLoading={isLoadingGeoJson}
          mapRef={mapRef}
          hoveredItem={hoveredItem}
        />
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Nearby Locations
        </h2>
        <LocationList
          geoJson={geoJson}
          isLoading={isLoadingGeoJson}
          viewState={debouncedViewState}
          onClick={panToLocation}
          setHoveredItem={setHoveredItem}
        />
      </div>
    </div>
  )
}
