import { useQuery } from "@tanstack/react-query";

import {
  PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY,
  publishedAvailabilitySnapshotQueryFn,
} from "./usePublishedAvailabilitySnapshot";

/** Reads statistics from the shared published availability snapshot query. */
export const useMcStats = () => {
  return useQuery({
    queryKey: PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY,
    queryFn: publishedAvailabilitySnapshotQueryFn,
    select: (snapshot) => snapshot.statistics,
  });
};
