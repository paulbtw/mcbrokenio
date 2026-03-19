import { NextResponse } from "next/server";

import {
  getStoreStats,
  STORE_DATA_REVALIDATE_SECONDS,
} from "@/server/store-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const storeStats = await getStoreStats();

  return NextResponse.json(storeStats, {
    headers: {
      "Cache-Control": `public, s-maxage=${STORE_DATA_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
