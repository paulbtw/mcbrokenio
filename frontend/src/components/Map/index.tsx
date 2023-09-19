'use client'

import { Popover } from '@/components/Map/Popover'
import { type McDataProperties } from '@/hooks/queries/useMcData'
import { useMcMarker } from '@/hooks/useMcMarker'
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

export function Map() {
  const { geoJson } = useMcMarker()
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

  console.log(selected)

  return (
    <MapGl
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY as string}
      mapLib={import('mapbox-gl')}
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5
      }}
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
          style={{ maxWidth: '20rem' }}
          closeButton={false}
        >
          <Popover {...selected.properties} />
        </Popup>
      )}
    </MapGl>
  )
}
