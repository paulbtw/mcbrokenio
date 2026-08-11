import type {
  GeoJson,
  LegacyPublishedAvailabilityStatistics,
  PublishedAvailabilitySnapshot,
} from "@mcbroken/mclogik/publishedAvailabilitySnapshot";
import type { MarketCode } from "@mcbroken/mclogik/types";
import { type QueryFunction } from "@tanstack/react-query";
import axios from "axios";

export const PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY = [
  "publishedAvailabilitySnapshot",
] as const;

const LEGACY_SNAPSHOT_PUBLISHED_AT = new Date(0).toISOString();

function isMissingSnapshot(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  return error.response?.status === 403 || error.response?.status === 404;
}

async function fetchLegacySnapshotAssets(
  signal?: AbortSignal,
): Promise<PublishedAvailabilitySnapshot> {
  const [{ data: markers }, { data: statistics }] = await Promise.all([
    axios.get<GeoJson>("/marker.json", { signal }),
    axios.get<LegacyPublishedAvailabilityStatistics[]>("/stats.json", {
      signal,
    }),
  ]);

  return {
    schemaVersion: 2,
    publishedAt: LEGACY_SNAPSHOT_PUBLISHED_AT,
    markers,
    statistics: statistics.map(({ country, ...metrics }) => ({
      ...metrics,
      market: country as MarketCode,
    })),
  };
}

/** Fetches the canonical availability snapshot published by the backend. */
export async function fetchPublishedAvailabilitySnapshot(
  signal?: AbortSignal,
): Promise<PublishedAvailabilitySnapshot> {
  try {
    const { data } = await axios.get<PublishedAvailabilitySnapshot>(
      "/snapshot.json",
      { signal },
    );

    return data;
  } catch (error) {
    if (!isMissingSnapshot(error)) throw error;

    return fetchLegacySnapshotAssets(signal);
  }
}

/** React Query function shared by all published snapshot projections. */
export const publishedAvailabilitySnapshotQueryFn: QueryFunction<
  PublishedAvailabilitySnapshot,
  typeof PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY
> = ({ signal }) => fetchPublishedAvailabilitySnapshot(signal);
