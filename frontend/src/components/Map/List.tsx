import { type ViewState } from '@/components/Map/Container'
import { type McDataGeometry } from '@/hooks/queries/useMcData'
import clsx from 'clsx'
import { useMemo } from 'react'

interface ListProps {
  isLoading: boolean
  geoJson?: McDataGeometry
  viewState: ViewState
  onClick?: (lat: number, lon: number) => void
}

const colorMap: Record<string, string> = {
  GREY: 'bg-gray-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-500'
}

export function List({ isLoading, geoJson, viewState, onClick }: ListProps) {
  const sortedByDistance = useMemo(() => {
    if (geoJson == null || isLoading) {
      return []
    }

    return geoJson.features
      .map((feature) => {
        const [lon, lat] = feature.geometry.coordinates
        const distance = Math.sqrt(
          Math.pow(lon - viewState.longitude, 2) +
            Math.pow(lat - viewState.latitude, 2)
        )

        return {
          ...feature,
          distance
        }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 25)
  }, [
    geoJson,
    isLoading,
    viewState.latitude,
    viewState.longitude
  ])

  return (
    <div className="basis-80 rounded-xl shadow h-full bg-white overflow-y-auto hidden lg:block">
    {sortedByDistance.map((feature) => {
      const colorClassName = colorMap[feature.properties.dot]
      return (
        <div key={feature.properties.id} onClick={() => { onClick?.(feature.geometry.coordinates[1], feature.geometry.coordinates[0]) }} className="px-3 py-4 flex gap-4 border-b border-slate-300 items-center last:border-0 cursor-pointer hover:bg-slate-100">
          <div className={clsx('w-4 h-4 rounded-full shrink-0', colorClassName)} />
          <div>
            <div className="text-xs font-semibold line-clamp-2">
              {feature.properties.name}
            </div>
          </div>
        </div>
      )
    })}
  </div>
  )
}
