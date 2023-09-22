import { Stats } from '@/components/Stats'
import { MapContainer } from '@/components/Map/Container'

export default function Home() {
  return (
    <div className="w-full box-border">
      <Stats />
      <div className="w-full h-[70vh]">
        <MapContainer />
      </div>
    </div>
  )
}
