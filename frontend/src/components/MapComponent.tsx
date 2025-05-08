'use client';

import { Dispatch, RefObject, SetStateAction } from 'react';
import { MapRef } from 'react-map-gl';

import { Map } from '@/components/Map';
import { McDataGeometry } from '@/hooks/queries/useMcData';

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MapComponentProps {
  geoJson?: McDataGeometry;
  viewState: ViewState;
  setViewState: Dispatch<SetStateAction<ViewState>>;
  isLoading: boolean;
  mapRef: RefObject<MapRef | null>;
  height?: number;
}

export function MapComponent({
  geoJson,
  viewState,
  setViewState,
  isLoading,
  mapRef,
  height = 500,
}: MapComponentProps) {
  return (
    <div className="flex h-full gap-4">
      <div
        className="grow rounded-xl shadow bg-white overflow-hidden"
        style={{ height: `${height}px` }}
      >
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
    </div>
  );
}
