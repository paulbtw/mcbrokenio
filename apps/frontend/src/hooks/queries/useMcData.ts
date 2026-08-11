import type {
  GeoJson,
  GeoJsonPos,
} from "@mcbroken/mclogik/publishedAvailabilitySnapshot";
import { useQuery } from "@tanstack/react-query";

import {
  publishedAvailabilitySnapshotQueryFn,
  publishedAvailabilitySnapshotQueryKey,
} from "./usePublishedAvailabilitySnapshot";

export type McDataProperties = GeoJsonPos["properties"];
export type McDataGeometry = GeoJson;

/** Reads map markers from the shared published availability snapshot query. */
export const useMcData = () => {
  return useQuery({
    queryKey: publishedAvailabilitySnapshotQueryKey,
    queryFn: publishedAvailabilitySnapshotQueryFn,
    select: (snapshot) => snapshot.markers,
  });
};
