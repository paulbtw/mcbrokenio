'use client'

import { useLocation } from '@/hooks/queries/useLocation'
import { useMcData } from '@/hooks/queries/useMcData'
import { Map } from '@/components/Map'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type MapRef } from 'react-map-gl'
import { useDebounce } from 'usehooks-ts'
import { List } from '@/components/Map/List'

export interface ViewState {
  latitude: number
  longitude: number
  zoom: number
}

export function MapContainer() {
  const mapRef = useRef<MapRef>(null)
  const { data: geoJson, isLoading: isLoadingGeoJson } = useMcData()
  const { data: location, isLoading: isLoadingLocation } = useLocation()
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 0,
    longitude: 0,
    zoom: 10
  })
  const debouncedViewState = useDebounce(viewState, 300)
  const isLoading = isLoadingGeoJson || isLoadingLocation

  useEffect(() => {
    setViewState({
      latitude: location?.lat ?? 52.5119151,
      longitude: location?.lon ?? 13.3668864,
      zoom: 10
    })
  }, [location])

  const onClick = useCallback((lat: number, lon: number) => {
    if (mapRef.current == null) {
      return
    }

    mapRef.current.panTo({ lat, lon })
  }, [])

  return (
    <div className="flex h-full gap-4">
      <div className="grow h-full rounded-xl shadow bg-white overflow-hidden">
        {isLoading && <div className="w-full h-full bg-slate-300" />}
        {!isLoading && (
          <Map
            geoJson={geoJson}
            setViewState={setViewState}
            viewState={viewState}
            ref={mapRef}
          />
        )}
      </div>
      <List
        isLoading={isLoading}
        viewState={debouncedViewState}
        geoJson={geoJson}
        onClick={onClick}
      />
    </div>
  )
}
