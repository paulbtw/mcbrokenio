import {
  type GeoJson,
} from "@mcbroken/mclogik/geoJson";
import {
  type CountryStats,
} from "@mcbroken/mclogik/repositories";

export const STORE_DATA_REVALIDATE_SECONDS = 300;
const DEFAULT_ASSETS_ORIGIN =
  "https://mcbrokenio-export-geojson-dev.s3.eu-central-1.amazonaws.com";

type AssetKey = "marker.json" | "stats.json";

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
  return fetchAssetJson<GeoJson>("marker.json");
}

export async function getStoreStats(): Promise<CountryStats[]> {
  return fetchAssetJson<CountryStats[]>("stats.json");
}
