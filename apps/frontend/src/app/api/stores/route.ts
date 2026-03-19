import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import {
  getStoreGeoJson,
  STORE_DATA_REVALIDATE_SECONDS,
} from "@/server/store-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getCachedStoreGeoJson = unstable_cache(getStoreGeoJson, ["store-geojson"], {
  revalidate: STORE_DATA_REVALIDATE_SECONDS,
});

export async function GET() {
  const storeGeoJson = await getCachedStoreGeoJson();

  return NextResponse.json(storeGeoJson, {
    headers: {
      "Cache-Control": `public, s-maxage=${STORE_DATA_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
