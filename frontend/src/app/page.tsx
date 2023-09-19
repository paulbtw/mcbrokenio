import { Map } from '@/components/Map'
import { Stats } from '@/components/Stats'

export default function Home() {
  return (
    <div className="w-full box-border">
      <Stats />
      <div className="w-full h-[70vh] rounded-xl overflow-hidden shadow">
        <Map />
      </div>
    </div>
  )
}
