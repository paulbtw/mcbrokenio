import { NextResponse } from "next/server";

import {
  getStoreGeoJson,
  STORE_DATA_REVALIDATE_SECONDS,
} from "@/server/store-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // The stores payload is large enough to exceed Next's unstable_cache item limit.
  const storeGeoJson = await getStoreGeoJson();

  return NextResponse.json(storeGeoJson, {
    headers: {
      "Cache-Control": `public, s-maxage=${STORE_DATA_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
