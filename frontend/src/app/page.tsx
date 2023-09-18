import { Map } from '@/components/Map'

export default function Home() {
  return (
    <div className="w-full box-border">
      <div>McBroken</div>
      <div className="w-full h-[70vh] rounded-xl overflow-hidden">
        <Map />
      </div>
    </div>
  )
}
