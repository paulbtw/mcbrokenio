'use client'

import { useMcMarker } from '@/hooks/useMcMarker'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Layer, Map as MapGl, Source } from 'react-map-gl'

export function Map() {
  const { geoJson } = useMcMarker()

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
    >
      <Source id="markers" type="geojson" data={geoJson}>
        <Layer
          id="Point"
          type="circle"
          paint={{
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2, 15, 7],
            'circle-color': {
              type: 'identity',
              property: 'dot'
            }
          }}
        />
      </Source>
    </MapGl>
  )
}
