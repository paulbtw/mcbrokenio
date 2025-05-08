'use client';

import { LocationList } from '@/components/LocationList';
import { MapComponent } from '@/components/MapComponent';
import { useMapInteractions } from '@/hooks/useMapInteractions';

interface DesktopViewProps {
  geo: {
    lat: number;
    lon: number;
  };
}

export function DesktopView({ geo }: DesktopViewProps) {
  const {
    mapRef,
    geoJson,
    isLoadingGeoJson,
    viewState,
    setViewState,
    debouncedViewState,
    panToLocation,
  } = useMapInteractions({ geo });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <MapComponent
          geoJson={geoJson}
          viewState={viewState}
          setViewState={setViewState}
          isLoading={isLoadingGeoJson}
          mapRef={mapRef}
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
        />
      </div>
    </div>
  );
}
