import { describe, expect, it } from "vitest";

import { getStatsSummary } from "./stats";

describe("getStatsSummary", () => {
  it("returns zeroes when aggregate stats are missing", () => {
    expect(getStatsSummary()).toEqual({
      trackablePercentage: 0,
      milkshakePercentage: 0,
      mcFlurryPercentage: 0,
      mcSundaePercentage: 0,
    });
  });

  it("calculates all percentages from the UNKNOWN aggregate row", () => {
    expect(
      getStatsSummary([
        {
          country: "UNKNOWN",
          total: 200,
          trackable: 150,
          availablemilkshakes: 45,
          totalmilkshakes: 60,
          availablemcflurry: 30,
          totalmcflurry: 50,
          availablemcsundae: 20,
          totalmcsundae: 40,
        },
      ]),
    ).toEqual({
      trackablePercentage: 75,
      milkshakePercentage: 75,
      mcFlurryPercentage: 60,
      mcSundaePercentage: 50,
    });
  });

  it("guards against divide-by-zero totals", () => {
    expect(
      getStatsSummary([
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
      ]),
    ).toEqual({
      trackablePercentage: 0,
      milkshakePercentage: 0,
      mcFlurryPercentage: 0,
      mcSundaePercentage: 0,
    });
  });
});
