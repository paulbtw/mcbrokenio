import { type Prisma } from "@mcbroken/db";
import {
  createGeoJson,
  type GeoJson,
  type GeoJsonSourcePos,
} from "@mcbroken/mclogik/geoJson";
import {
  type CountryStats,
  createStatsRepository,
} from "@mcbroken/mclogik/repositories";

export const STORE_DATA_REVALIDATE_SECONDS = 300;

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

export async function getStoreGeoJson(): Promise<GeoJson> {
  const { prisma } = await import("@mcbroken/db/client");
  const stores: GeoJsonSourcePos[] = await prisma.pos.findMany({
    select: storeGeoJsonSelect,
    orderBy: [{ country: "asc" }, { id: "asc" }],
  });

  return createGeoJson(stores);
}

export async function getStoreStats(): Promise<CountryStats[]> {
  const { prisma } = await import("@mcbroken/db/client");
  return createStatsRepository(prisma).getAggregatedStats();
}
