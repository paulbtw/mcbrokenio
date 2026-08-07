import type {
  GeoJson,
  GeoJsonPos,
} from "@mcbroken/mclogik/publishedAvailabilitySnapshot";
import { type QueryFunction, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type McDataProperties = GeoJsonPos["properties"];
export type McDataGeometry = GeoJson;

const fetchMcData: QueryFunction<McDataGeometry> = async ({ signal }) => {
  const { data } = await axios.get<McDataGeometry>("/marker.json", {
    signal,
  });

  return data;
};

export const useMcData = () => {
  return useQuery({
    queryKey: ["mcData"],
    queryFn: fetchMcData,
  });
};
