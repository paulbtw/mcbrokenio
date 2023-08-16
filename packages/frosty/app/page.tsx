'use client';

import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function generateCoordinatesMesh(
  {
    maxLatitude,
    maxLongitude,
    minLatitude,
    minLongitude,
  }: {
    maxLatitude: number;
    maxLongitude: number;
    minLatitude: number;
    minLongitude: number;
  },
  intervalKilometer = 66,
) {
  const coordinatesMesh = [];

  for (
    let lat = minLatitude;
    lat <= maxLatitude;
    lat += intervalKilometer / 111.32
  ) {
    for (
      let lon = minLongitude;
      lon <= maxLongitude;
      lon += intervalKilometer / (111.32 * Math.cos(lat * (Math.PI / 180)))
    ) {
      coordinatesMesh.push({ latitude: lat, longitude: lon });
    }
  }

  return coordinatesMesh;
}

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

export default async function Index() {
  const marker = generateCoordinatesMesh({
    minLatitude: -43.003,
    maxLatitude: -30.003,
    minLongitude: 113.338,
    maxLongitude: 153.569,
  });

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Map
        mapStyle="mapbox://styles/paaulbtw/ckw14wqnw07is14ny2oagkdvb"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
        minZoom={2}
        maxZoom={15}
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {marker.map(({ latitude, longitude }, index) => (
          <Marker
            key={index}
            latitude={latitude}
            longitude={longitude}
            anchor="bottom"
          >
            <svg
              height={20}
              viewBox="0 0 24 24"
              style={{ fill: '#d00', stroke: 'none' }}
            >
              <path d={ICON} />
            </svg>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
