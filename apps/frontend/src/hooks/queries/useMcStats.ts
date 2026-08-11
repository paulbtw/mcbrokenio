import { useQuery } from "@tanstack/react-query";

import {
  publishedAvailabilitySnapshotQueryFn,
  publishedAvailabilitySnapshotQueryKey,
} from "./usePublishedAvailabilitySnapshot";

/** Reads statistics from the shared published availability snapshot query. */
export const useMcStats = () => {
  return useQuery({
    queryKey: publishedAvailabilitySnapshotQueryKey,
    queryFn: publishedAvailabilitySnapshotQueryFn,
    select: (snapshot) => snapshot.statistics,
  });
};
