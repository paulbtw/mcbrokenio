'use client'

import { MapIcon, MapPin } from 'lucide-react'
import { useState } from 'react'

import { LocationList } from '@/components/LocationList'
import { MapComponent } from '@/components/MapComponent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMapInteractions } from '@/hooks/useMapInteractions'

export function MobileView({ geo }: { geo: { lat: number, lon: number } }) {
  const [activeTab, setActiveTab] = useState('map')
  const {
    mapRef,
    geoJson,
    isLoadingGeoJson,
    viewState,
    setViewState,
    debouncedViewState,
    panToLocation
  } = useMapInteractions({ geo })
  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-slate-800">
      <Tabs defaultValue="map" className="w-full" onValueChange={setActiveTab}>
        <div className="border-b px-4 dark:border-slate-700">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700"
            >
              <MapIcon className="mr-2 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Locations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="m-0">
          <div className="p-4">
            <MapComponent
              height={activeTab === 'map' ? 400 : 0}
              viewState={viewState}
              setViewState={setViewState}
              isLoading={isLoadingGeoJson}
              mapRef={mapRef}
              geoJson={geoJson}
            />
          </div>
        </TabsContent>

        <TabsContent value="locations" className="m-0">
          <div className="p-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
