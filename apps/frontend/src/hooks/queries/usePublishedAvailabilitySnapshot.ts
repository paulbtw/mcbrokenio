import type { PublishedAvailabilitySnapshot } from "@mcbroken/mclogik/publishedAvailabilitySnapshot";
import { type QueryFunction } from "@tanstack/react-query";
import axios from "axios";

export const publishedAvailabilitySnapshotQueryKey = [
  "publishedAvailabilitySnapshot",
] as const;

export async function fetchPublishedAvailabilitySnapshot(
  signal?: AbortSignal,
): Promise<PublishedAvailabilitySnapshot> {
  const { data } = await axios.get<PublishedAvailabilitySnapshot>(
    "/snapshot.json",
    { signal },
  );

  return data;
}

export const publishedAvailabilitySnapshotQueryFn: QueryFunction<
  PublishedAvailabilitySnapshot,
  typeof publishedAvailabilitySnapshotQueryKey
> = ({ signal }) => fetchPublishedAvailabilitySnapshot(signal);
