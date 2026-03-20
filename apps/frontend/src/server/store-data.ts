import { type Prisma } from "@mcbroken/db";
import {
  type GeoJson,
  type GeoJsonSourcePos,
} from "@mcbroken/mclogik/geoJson";
import {
  type CountryStats,
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
  const [{ prisma }, { createGeoJson }] = await Promise.all([
    import("@mcbroken/db/client"),
    import("@mcbroken/mclogik/geoJson"),
  ]);
  const stores: GeoJsonSourcePos[] = await prisma.pos.findMany({
    select: storeGeoJsonSelect,
    orderBy: [{ country: "asc" }, { id: "asc" }],
  });

  return createGeoJson(stores);
}

export async function getStoreStats(): Promise<CountryStats[]> {
  const [{ prisma }, { createStatsRepository }] = await Promise.all([
    import("@mcbroken/db/client"),
    import("@mcbroken/mclogik/repositories"),
  ]);
  return createStatsRepository(prisma).getAggregatedStats();
}
