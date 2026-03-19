import { type Prisma } from "@mcbroken/db";
import {
  type GeoJson,
  type GeoJsonSourcePos,
} from "@mcbroken/mclogik/geoJson";
import {
  type CountryStats,
} from "@mcbroken/mclogik/repositories";

export const STORE_DATA_REVALIDATE_SECONDS = 300;
const DEFAULT_ASSETS_ORIGIN =
  "https://mcbrokenio-export-geojson-dev.s3.eu-central-1.amazonaws.com";

type AssetKey = "marker.json" | "stats.json";

const storeGeoJsonSelect = {
  id: true,
  name: true,
  latitude: true,
  longitude: true,
  milkshakeStatus: true,
  milkshakeCount: true,
  milkshakeError: true,
  mcSundaeStatus: true,
  mcSundaeCount: true,
  mcSundaeError: true,
  mcFlurryStatus: true,
  mcFlurryCount: true,
  mcFlurryError: true,
  lastChecked: true,
  customItems: true,
  hasMobileOrdering: true,
  isResponsive: true,
} satisfies Prisma.PosSelect;

function getAssetsOrigin(): string {
  return (
    process.env.MCBROKEN_ASSETS_ORIGIN?.replace(/\/$/, "") ??
    DEFAULT_ASSETS_ORIGIN
  );
}

async function fetchAssetJson<T>(key: AssetKey): Promise<T> {
  const response = await fetch(`${getAssetsOrigin()}/${key}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${key}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getStoreGeoJson(): Promise<GeoJson> {
  if (!process.env.DATABASE_URL) {
    return fetchAssetJson<GeoJson>("marker.json");
  }

  try {
    const [{ prisma }, { createGeoJson }] = await Promise.all([
      import("@mcbroken/db/client"),
      import("@mcbroken/mclogik/geoJson"),
    ]);
    const stores: GeoJsonSourcePos[] = await prisma.pos.findMany({
      select: storeGeoJsonSelect,
      orderBy: [{ country: "asc" }, { id: "asc" }],
    });

    return createGeoJson(stores);
  } catch (error) {
    console.error("Falling back to exported store data", error);
    return fetchAssetJson<GeoJson>("marker.json");
  }
}

export async function getStoreStats(): Promise<CountryStats[]> {
  if (!process.env.DATABASE_URL) {
    return fetchAssetJson<CountryStats[]>("stats.json");
  }

  try {
    const [{ prisma }, { createStatsRepository }] = await Promise.all([
      import("@mcbroken/db/client"),
      import("@mcbroken/mclogik/repositories"),
    ]);
    return createStatsRepository(prisma).getAggregatedStats();
  } catch (error) {
    console.error("Falling back to exported stats data", error);
    return fetchAssetJson<CountryStats[]>("stats.json");
  }
}
