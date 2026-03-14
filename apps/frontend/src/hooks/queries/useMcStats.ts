import { type QueryFunction, useQuery } from "react-query";
import axios from "axios";

import { type McStats } from "@/lib/stats";

const fetchMcStats: QueryFunction<McStats[]> = async ({ signal }) => {
  const { data } = await axios.get<McStats[]>("/assets/stats.json", {
    signal,
  });

  return data;
};

export const useMcStats = () => {
  return useQuery({
    queryKey: "mcStats",
    queryFn: fetchMcStats,
  });
};
