import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const STORE_DATA_REVALIDATE_SECONDS = 300;
const DEFAULT_ASSETS_ORIGIN =
  "https://mcbrokenio-export-geojson-dev.s3.eu-central-1.amazonaws.com";

function getStatsUrl(): string {
  const origin =
    process.env.MCBROKEN_ASSETS_ORIGIN?.replace(/\/$/, "") ??
    DEFAULT_ASSETS_ORIGIN;

  return `${origin}/stats.json`;
}

export async function GET() {
  const response = await fetch(getStatsUrl(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats.json: ${response.status}`);
  }

  const storeStats = await response.json();

  return NextResponse.json(storeStats, {
    headers: {
      "Cache-Control": `public, s-maxage=${STORE_DATA_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
