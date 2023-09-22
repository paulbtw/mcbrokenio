'use client'

import { Popover } from '@/components/Map/Popover'
import { type McDataGeometry, type McDataProperties } from '@/hooks/queries/useMcData'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useCallback, useState } from 'react'
import {
  Layer,
  Map as MapGl,
  type MapLayerMouseEvent,
  Source,
  Popup
} from 'react-map-gl'

interface PopupMarker {
  properties: McDataProperties
  geometry: {
    coordinates: [number, number]
  }
}

interface MapProps {
  geoJson?: McDataGeometry
  location: {
    lat: number
    lon: number
  }
}

export function Map({ geoJson, location: { lat, lon } }: MapProps) {
  const [viewState, setViewState] = useState({
    latitude: lat,
    longitude: lon,
    zoom: 10
  })
  const [selected, setSelected] = useState<PopupMarker | null>(null)

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event?.features?.[0]

    if (feature == null) {
      setSelected(null)
      return
    }

    const properties = {
      ...feature.properties,
      customItems: {
        ...(typeof feature.properties?.customItems === 'string'
          ? JSON.parse(feature.properties?.customItems)
          : feature.properties?.customItems)
      }
    }

    if (feature.geometry.type === 'Point') {
      setSelected({
        properties: properties as McDataProperties,
        geometry: {
          coordinates: feature.geometry.coordinates as [number, number]
        }
      })
    }
  }, [])

  return (
    <MapGl
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY as string}
      mapLib={import('mapbox-gl')}
      {...viewState}
      onMove={(nextViewState) => { setViewState(nextViewState.viewState) }}
      mapStyle="mapbox://styles/paaulbtw/ckw14wqnw07is14ny2oagkdvb"
      interactiveLayerIds={['points']}
      onClick={onClick}
      minZoom={2}
      maxZoom={15}
    >
      {geoJson != null && (
        <Source id="data" type="geojson" data={geoJson}>
          <Layer
            id="points"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                2,
                2,
                15,
                7
              ],
              'circle-color': {
                type: 'identity',
                property: 'dot'
              }
            }}
          />
        </Source>
      )}

      {selected != null && (
        <Popup
          latitude={selected.geometry.coordinates[1]}
          longitude={selected.geometry.coordinates[0]}
          closeOnMove={false}
          maxWidth="20rem"
          closeButton={false}
        >
          <Popover {...selected.properties} />
        </Popup>
      )}
    </MapGl>
  )
}
