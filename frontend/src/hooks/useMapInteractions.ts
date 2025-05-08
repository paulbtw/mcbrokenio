import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MapRef } from 'react-map-gl';

// Corrected import
import { McDataGeometry, useMcData } from '@/hooks/queries/useMcData';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_LATITUDE } from '@/lib/constants';
import { DEFAULT_LONGITUDE } from '@/lib/constants';

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface UseMapInteractionsOutput {
  mapRef: RefObject<MapRef | null>;
  geoJson?: McDataGeometry;
  isLoadingGeoJson: boolean;
  viewState: ViewState;
  setViewState: Dispatch<SetStateAction<ViewState>>;
  debouncedViewState: ViewState;
  panToLocation: (lat: number, lon: number) => void;
}

export function useMapInteractions({
  geo,
}: {
  geo: { lat?: number; lon?: number };
}): UseMapInteractionsOutput {
  const mapRef = useRef<MapRef | null>(null);
  const { data: geoJson, isLoading: isLoadingGeoJson } = useMcData();

  const [viewState, setViewState] = useState<ViewState>({
    latitude: geo.lat ?? DEFAULT_LATITUDE,
    longitude: geo.lon ?? DEFAULT_LONGITUDE,
    zoom: 10,
  });

  const debouncedViewState = useDebounce(viewState, 300);

  useEffect(() => {
    if (geo) {
      setViewState((prevViewState) => ({
        ...prevViewState,
        latitude:
          typeof geo.lat === 'number' ? geo.lat : prevViewState.latitude,
        longitude:
          typeof geo.lon === 'number' ? geo.lon : prevViewState.longitude,
      }));
    }
  }, [geo]);

  const panToLocation = useCallback(
    (lat: number, lon: number) => {
      if (mapRef?.current == null) {
        return;
      }
      mapRef.current.panTo({ lat, lon });
    },
    [mapRef],
  );

  return {
    mapRef,
    geoJson,
    isLoadingGeoJson,
    viewState,
    setViewState,
    debouncedViewState,
    panToLocation,
  };
}
