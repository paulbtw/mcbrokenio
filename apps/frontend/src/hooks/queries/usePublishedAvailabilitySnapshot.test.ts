import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchPublishedAvailabilitySnapshot,
  PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY,
} from "./usePublishedAvailabilitySnapshot";

vi.mock("axios");

describe("Published Availability Snapshot query", () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
  });

  it("uses one stable query key for all snapshot readers", () => {
    expect(PUBLISHED_AVAILABILITY_SNAPSHOT_QUERY_KEY).toEqual([
      "publishedAvailabilitySnapshot",
    ]);
  });

  it("fetches the canonical snapshot representation", async () => {
    const snapshot = {
      schemaVersion: 2 as const,
      publishedAt: "2026-08-11T08:00:00.000Z",
      markers: {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [13.4, 52.5, 0] as [number, number, number],
            },
            properties: {
              hasMilchshake: "AVAILABLE" as const,
              milkshakeCount: 1,
              milkshakeErrorCount: 0,
              hasMcSundae: "UNAVAILABLE" as const,
              mcSundaeCount: 1,
              mcSundaeErrorCount: 1,
              hasMcFlurry: "PARTIAL_AVAILABLE" as const,
              mcFlurryCount: 2,
              mcFlurryErrorCount: 1,
              lastChecked: null,
              customItems: [],
              name: "Berlin",
              dot: "YELLOW" as const,
              hasMobileOrdering: true,
              isResponsive: true,
              id: "DE-1",
            },
          },
        ],
      },
      statistics: [
        {
          market: "DE",
          total: 1,
          trackable: 1,
          availablemilkshakes: 1,
          totalmilkshakes: 1,
          availablemcflurry: 0,
          totalmcflurry: 1,
          availablemcsundae: 0,
          totalmcsundae: 1,
        },
      ],
    };
    vi.mocked(axios.get).mockResolvedValue({ data: snapshot });
    const signal = new AbortController().signal;

    await expect(fetchPublishedAvailabilitySnapshot(signal)).resolves.toBe(
      snapshot,
    );
    expect(axios.get).toHaveBeenCalledWith("/snapshot.json", { signal });
  });

  it.each([
    [
      "unsupported schema version",
      {
        schemaVersion: 1,
        publishedAt: "2026-08-11T08:00:00.000Z",
        markers: { type: "FeatureCollection", features: [] },
        statistics: [],
      },
    ],
    [
      "malformed markers",
      {
        schemaVersion: 2,
        publishedAt: "2026-08-11T08:00:00.000Z",
        markers: {
          type: "FeatureCollection",
          features: [{ type: "Feature" }],
        },
        statistics: [],
      },
    ],
    [
      "malformed statistics",
      {
        schemaVersion: 2,
        publishedAt: "2026-08-11T08:00:00.000Z",
        markers: { type: "FeatureCollection", features: [] },
        statistics: [{ market: "US", total: "one" }],
      },
    ],
  ])("rejects a canonical snapshot with %s", async (_reason, snapshot) => {
    vi.mocked(axios.get).mockResolvedValue({ data: snapshot });

    await expect(fetchPublishedAvailabilitySnapshot()).rejects.toThrow(
      "Published availability snapshot response was invalid",
    );
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it.each([403, 404])(
    "falls back to compatibility assets when snapshot.json returns %i",
    async (status) => {
      const markers = {
        type: "FeatureCollection" as const,
        features: [],
      };
      const legacyStatistics = [
        {
          country: "UNKNOWN",
          total: 0,
          trackable: 0,
          availablemilkshakes: 0,
          totalmilkshakes: 0,
          availablemcflurry: 0,
          totalmcflurry: 0,
          availablemcsundae: 0,
          totalmcsundae: 0,
        },
      ];
      vi.mocked(axios.get)
        .mockRejectedValueOnce(
          Object.assign(new Error("snapshot unavailable"), {
            name: "AxiosError",
            isAxiosError: true,
            response: { status },
          }),
        )
        .mockResolvedValueOnce({ data: markers })
        .mockResolvedValueOnce({ data: legacyStatistics });
      const signal = new AbortController().signal;

      await expect(fetchPublishedAvailabilitySnapshot(signal)).resolves.toEqual(
        {
          schemaVersion: 2,
          publishedAt: "1970-01-01T00:00:00.000Z",
          markers,
          statistics: [
            {
              market: "UNKNOWN",
              total: 0,
              trackable: 0,
              availablemilkshakes: 0,
              totalmilkshakes: 0,
              availablemcflurry: 0,
              totalmcflurry: 0,
              availablemcsundae: 0,
              totalmcsundae: 0,
            },
          ],
        },
      );
      expect(axios.get).toHaveBeenNthCalledWith(2, "/marker.json", { signal });
      expect(axios.get).toHaveBeenNthCalledWith(3, "/stats.json", { signal });
    },
  );

  it("does not mask other snapshot failures with compatibility data", async () => {
    const failure = Object.assign(new Error("snapshot failed"), {
      name: "AxiosError",
      isAxiosError: true,
      response: { status: 500 },
    });
    vi.mocked(axios.get).mockRejectedValue(failure);

    await expect(fetchPublishedAvailabilitySnapshot()).rejects.toBe(failure);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
