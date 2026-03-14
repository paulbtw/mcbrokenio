import { describe, expect, it } from "vitest";

import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "./constants";
import { parseGeoCookie } from "./geo";

describe("parseGeoCookie", () => {
  it("returns defaults when the cookie is missing", () => {
    expect(parseGeoCookie()).toEqual({
      lat: DEFAULT_LATITUDE,
      lon: DEFAULT_LONGITUDE,
    });
  });

  it("returns defaults when the cookie is invalid JSON", () => {
    expect(parseGeoCookie("{invalid")).toEqual({
      lat: DEFAULT_LATITUDE,
      lon: DEFAULT_LONGITUDE,
    });
  });

  it("returns parsed coordinates when both values are present", () => {
    expect(parseGeoCookie(JSON.stringify({ lat: 40.7, lon: -74 }))).toEqual({
      lat: 40.7,
      lon: -74,
    });
  });

  it("falls back per field when a parsed value is missing", () => {
    expect(parseGeoCookie(JSON.stringify({ lat: 51.5 }))).toEqual({
      lat: 51.5,
      lon: DEFAULT_LONGITUDE,
    });
  });
});
