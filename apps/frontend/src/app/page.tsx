import { cookies } from "next/headers";

import { DesktopView } from "@/components/DesktopView";
import { MobileView } from "@/components/MobileView";
import { Stats } from "@/components/Stats";
import { parseGeoCookie } from "@/lib/geo";

export default async function Home() {
  const currentCookies = await cookies();
  const geoData = parseGeoCookie(currentCookies.get("geo")?.value);

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
  );
}
