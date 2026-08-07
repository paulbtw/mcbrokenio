import type { PublishedAvailabilityStatistics } from "@mcbroken/mclogik/publishedAvailabilitySnapshot";
import { type QueryFunction, useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchMcStats: QueryFunction<PublishedAvailabilityStatistics[]> = async ({
  signal,
}) => {
  const { data } = await axios.get<PublishedAvailabilityStatistics[]>("/stats.json", {
    signal,
  });

  return data;
};

export const useMcStats = () => {
  return useQuery({
    queryKey: ["mcStats"],
    queryFn: fetchMcStats,
  });
};
