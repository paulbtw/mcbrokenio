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
      markers: { type: "FeatureCollection" as const, features: [] },
      statistics: [],
    };
    vi.mocked(axios.get).mockResolvedValue({ data: snapshot });
    const signal = new AbortController().signal;

    await expect(fetchPublishedAvailabilitySnapshot(signal)).resolves.toBe(
      snapshot,
    );
    expect(axios.get).toHaveBeenCalledWith("/snapshot.json", { signal });
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
