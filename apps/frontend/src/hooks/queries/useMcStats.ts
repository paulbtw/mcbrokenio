import { useQuery } from "@tanstack/react-query";

import {
  publishedAvailabilitySnapshotQueryFn,
  publishedAvailabilitySnapshotQueryKey,
} from "./usePublishedAvailabilitySnapshot";

export const useMcStats = () => {
  return useQuery({
    queryKey: publishedAvailabilitySnapshotQueryKey,
    queryFn: publishedAvailabilitySnapshotQueryFn,
    select: (snapshot) => snapshot.statistics,
  });
};
