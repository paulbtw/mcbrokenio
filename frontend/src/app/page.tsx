import { Map } from '@/components/Map'

export default function Home() {
  return (
    <main className="h-screen max-w-5xl p-5 flex items-center flex-col grow">
      <div>McBroken</div>
      <div className="w-full h-[70vh]">
        <Map />
      </div>
    </main>
  )
}
