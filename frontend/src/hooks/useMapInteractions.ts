import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { type MapRef } from 'react-map-gl'

// Corrected import
import { type McDataGeometry, useMcData } from '@/hooks/queries/useMcData'
import { useDebounce } from '@/hooks/useDebounce'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants'

export interface ViewState {
  latitude: number
  longitude: number
  zoom: number
}

interface UseMapInteractionsOutput {
  mapRef: RefObject<MapRef | null>
  geoJson?: McDataGeometry
  isLoadingGeoJson: boolean
  viewState: ViewState
  setViewState: Dispatch<SetStateAction<ViewState>>
  debouncedViewState: ViewState
  panToLocation: (lat: number, lon: number) => void
}

export function useMapInteractions({
  geo
}: {
  geo: { lat?: number, lon?: number }
}): UseMapInteractionsOutput {
  const mapRef = useRef<MapRef | null>(null)
  const { data: geoJson, isLoading: isLoadingGeoJson } = useMcData()

  const [viewState, setViewState] = useState<ViewState>({
    latitude: geo.lat ?? DEFAULT_LATITUDE,
    longitude: geo.lon ?? DEFAULT_LONGITUDE,
    zoom: 10
  })

  const debouncedViewState = useDebounce(viewState, 300)

  useEffect(() => {
    if (geo.lat != null && geo.lon != null) {
      setViewState((prevViewState) => ({
        ...prevViewState,
        latitude:
          typeof geo.lat === 'number' ? geo.lat : prevViewState.latitude,
        longitude:
          typeof geo.lon === 'number' ? geo.lon : prevViewState.longitude
      }))
    }
  }, [geo])

  const panToLocation = useCallback(
    (lat: number, lon: number) => {
      if (mapRef?.current == null) {
        return
      }
      mapRef.current.panTo({ lat, lon })
    },
    [mapRef]
  )

  return {
    mapRef,
    geoJson,
    isLoadingGeoJson,
    viewState,
    setViewState,
    debouncedViewState,
    panToLocation
  }
}
