import type { PublishedAvailabilityStatistics } from "@mcbroken/mclogik/publishedAvailabilitySnapshot";

export interface StatsSummary {
  trackablePercentage: number;
  milkshakePercentage: number;
  mcFlurryPercentage: number;
  mcSundaePercentage: number;
}

const EMPTY_STATS_SUMMARY: StatsSummary = {
  trackablePercentage: 0,
  milkshakePercentage: 0,
  mcFlurryPercentage: 0,
  mcSundaePercentage: 0,
};

function toPercentage(available: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (available / total) * 100;
}

export function getStatsSummary(
  data?: PublishedAvailabilityStatistics[],
): StatsSummary {
  const totalStats = data?.find((item) => item.market === "UNKNOWN");

  if (!totalStats) {
    return EMPTY_STATS_SUMMARY;
  }

  return {
    trackablePercentage: toPercentage(totalStats.trackable, totalStats.total),
    milkshakePercentage: toPercentage(
      totalStats.availablemilkshakes,
      totalStats.totalmilkshakes,
    ),
    mcFlurryPercentage: toPercentage(
      totalStats.availablemcflurry,
      totalStats.totalmcflurry,
    ),
    mcSundaePercentage: toPercentage(
      totalStats.availablemcsundae,
      totalStats.totalmcsundae,
    ),
  };
}
