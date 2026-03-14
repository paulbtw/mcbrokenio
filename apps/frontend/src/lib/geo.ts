import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "./constants";

export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export function parseGeoCookie(value?: string | null): GeoCoordinates {
  if (!value) {
    return {
      lat: DEFAULT_LATITUDE,
      lon: DEFAULT_LONGITUDE,
    };
  }

  try {
    const parsedValue = JSON.parse(value) as Partial<GeoCoordinates>;

    return {
      lat:
        typeof parsedValue.lat === "number" && Number.isFinite(parsedValue.lat)
          ? parsedValue.lat
          : DEFAULT_LATITUDE,
      lon:
        typeof parsedValue.lon === "number" && Number.isFinite(parsedValue.lon)
          ? parsedValue.lon
          : DEFAULT_LONGITUDE,
    };
  } catch {
    return {
      lat: DEFAULT_LATITUDE,
      lon: DEFAULT_LONGITUDE,
    };
  }
}
