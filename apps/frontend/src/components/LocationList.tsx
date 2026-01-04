import { useMemo } from 'react'
import { MapPin } from 'lucide-react'

import { type ViewState } from '@/components/MapComponent'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { type McDataGeometry,type McDataProperties } from '@/hooks/queries/useMcData'

interface ListProps {
  isLoading: boolean
  geoJson?: McDataGeometry
  viewState: ViewState
  onClick?: (lat: number, lon: number) => void
  setHoveredItem?: (item: GeoJSON.Feature<GeoJSON.Point, McDataProperties> | null) => void
}

const colorMap: Record<string, string> = {
  GREY: 'text-gray-500',
  GREEN: 'text-green-500',
  YELLOW: 'text-yellow-500',
  RED: 'text-red-500'
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function LocationList({
  isLoading,
  geoJson,
  viewState,
  onClick,
  setHoveredItem
}: ListProps) {
  const sortedByDistance = useMemo(() => {
    if (geoJson == null) {
      return []
    }

    type LocationWithDistance = GeoJSON.Feature<GeoJSON.Point, McDataProperties> & {
      distance: number
    }

    return geoJson.features
      .map((feature) => {
        const [lon, lat] = feature.geometry.coordinates

        if (lat == null || lon == null) {
          return null
        }

        const distance = getDistanceFromLatLonInKm(
          viewState.latitude,
          viewState.longitude,
          lat,
          lon
        )

        return {
          ...feature,
          distance
        } as LocationWithDistance
      })
      .filter((feature): feature is LocationWithDistance => feature != null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 25)
  }, [geoJson, viewState.latitude, viewState.longitude])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="pr-4 h-[450px]">
      <div className="space-y-4">
        {sortedByDistance.map((location) => (
          <div
            key={location.id}
            className="flex items-start gap-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md p-2"
            onClick={() => {
              const coords = location.geometry.coordinates
              const lat = coords?.[1]
              const lon = coords?.[0]
              if (
                coords == null ||
                coords.length < 2 ||
                lat == null ||
                lon == null ||
                !Number.isFinite(lat) ||
                !Number.isFinite(lon)
              ) {
                console.error('Invalid coordinates for location:', location)
                return
              }
              onClick?.(lat, lon)
            }}
            onMouseEnter={() =>
              setHoveredItem?.(location)
            }
            onMouseLeave={() => setHoveredItem?.(null)}
          >
            <div className={`self-center ${colorMap[location.properties.dot]}`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
                  {location.properties.name}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {location.distance.toFixed(2)} km
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
