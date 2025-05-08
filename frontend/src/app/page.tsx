import { cookies } from 'next/headers'

import { DesktopView } from '@/components/DesktopView'
import { MobileView } from '@/components/MobileView'
import { Stats } from '@/components/Stats'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants'

export default async function Home() {
  const currentCookies = await cookies()
  const geo = currentCookies.get('geo')
  const geoData = (geo != null)
    ? JSON.parse(geo.value)
    : { lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE }
  console.log(geoData)
  return (
    <>
      <Stats />

      <div className="mt-6 hidden lg:block">
        <DesktopView geo={geoData} />
      </div>

      <div className="mt-6 lg:hidden">
        <MobileView geo={geoData} />
      </div>
    </>
  )
}
