import { type Pos } from "@mcbroken/db";
import { prisma } from "@mcbroken/db/client";
import axios from "axios";
import PQueue from "p-queue";

import { type RequestLimiter } from "../../constants/RateLimit";
import {
  addBreadcrumb,
  captureBatchSummary,
  type BatchFailureSample,
} from "../../sentry";
import {
  type APIType,
  type ICountryInfos,
  type Locations,
  type UpdatePos,
} from "../../types";
import { getMetaForApi } from "../../utils/getMetaForApi";
import { getPosByCountries } from "../../utils/getPosByCountries";

import { getItemStatusMap } from "./getItemStatus/index";
import { getFailedPos, getUpdatedPos } from "./getUpdatedPos";
import { updatePos } from "./updatePos";

type JsonRecord = Record<string, unknown>;

function getStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function getRecordValue(value: unknown): JsonRecord | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return undefined;
}

function createFailureSignature(sample: Omit<BatchFailureSample, "signature">) {
  return [
    sample.apiType,
    sample.country,
    sample.httpStatus ?? "unknown",
    sample.responseCode ?? "unknown",
    sample.responseType ?? sample.errorName,
    sample.responseMessage ?? sample.errorMessage,
  ].join("|");
}

function createBatchFailureSample(
  error: unknown,
  apiType: APIType,
  pos: Pos,
): BatchFailureSample {
  const baseSample = {
    apiType,
    country: pos.country,
    storeId: pos.id,
    nationalStoreNumber: pos.nationalStoreNumber,
  };

  if (axios.isAxiosError(error)) {
    const responseData = getRecordValue(error.response?.data);
    const statusData = getRecordValue(responseData?.status);
    const responseErrors = Array.isArray(statusData?.errors)
      ? statusData.errors
          .slice(0, 3)
          .map((item) => getRecordValue(item))
          .filter((item): item is JsonRecord => item != null)
          .map((item) => ({
            code: getStringValue(item.code),
            type: getStringValue(item.type),
            message: getStringValue(item.message),
            property: getStringValue(item.property),
            service: getStringValue(item.service),
          }))
      : undefined;

    const sample: Omit<BatchFailureSample, "signature"> = {
      ...baseSample,
      errorName: error.name,
      errorMessage: error.message,
      requestUrl: error.config?.url,
      httpStatus: error.response?.status,
      responseCode: getStringValue(statusData?.code),
      responseType: getStringValue(statusData?.type),
      responseMessage:
        getStringValue(statusData?.message) ??
        getStringValue(responseData?.message),
      responseService: getStringValue(statusData?.service),
      responseErrors,
    };

    return {
      ...sample,
      signature: createFailureSignature(sample),
    };
  }

  const sample: Omit<BatchFailureSample, "signature"> = {
    ...baseSample,
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage:
      error instanceof Error ? error.message : "Item status request failed",
  };

  return {
    ...sample,
    signature: createFailureSignature(sample),
  };
}

export async function getItemStatus(
  apiType: APIType,
  requestLimiter: RequestLimiter,
  countryList?: Locations[],
) {
  const queue = new PQueue({
    concurrency: requestLimiter.concurrentRequests,
  });

  const asyncTasks: Array<Promise<void>> = [];
  const posMap = new Map<string, UpdatePos>();
  const countryStats: Record<string, { total: number; failed: number }> = {};
  const sampleErrors = new Map<string, BatchFailureSample>();
  const startTime = Date.now();

  const maxRequestsPerSecond = requestLimiter.maxRequestsPerSecond;
  let requestsThisSecond = 0;

  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true,
  );
  const countries = countryInfos.map((countryInfo) => countryInfo.country);
  const countriesRecord = countryInfos.reduce<Record<string, ICountryInfos>>(
    (acc, countryInfo) => {
      acc[countryInfo.country] = countryInfo;
      return acc;
    },
    {},
  );

  function recordFailure(pos: Pos, error: unknown) {
    const sample = createBatchFailureSample(error, apiType, pos);
    const stats = countryStats[pos.country] ?? { total: 0, failed: 0 };

    if (
      !sampleErrors.has(sample.signature) &&
      sampleErrors.size < 5
    ) {
      sampleErrors.set(sample.signature, sample);
      console.error("Item status request failed", sample);
    }

    stats.failed++;
    countryStats[pos.country] = stats;

    const failedPosUpdate = getFailedPos(pos);
    posMap.set(pos.id, failedPosUpdate);
  }

  async function processPos(pos: Pos) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      requestsThisSecond = 0;
    }

    requestsThisSecond++;

    // Track per-country stats
    const country = pos.country;
    if (!countryStats[country]) {
      countryStats[country] = { total: 0, failed: 0 };
    }
    countryStats[country].total++;

    try {
      const itemStatus = await getItemStatusMap[apiType](
        pos,
        countriesRecord,
        token,
        clientId,
      );

      if (itemStatus == null) {
        recordFailure(pos, new Error("Item status request returned null"));
        return;
      }

      const posToUpdate = getUpdatedPos(pos, itemStatus);
      posMap.set(pos.id, posToUpdate);
    } catch (error) {
      recordFailure(pos, error);
      return;
    }
  }

  const posToCheck = await getPosByCountries(prisma, countries);

  addBreadcrumb("Starting batch processing", {
    apiType,
    storeCount: posToCheck.length,
  });

  if (posToCheck.length === 0) {
    return;
  }

  posToCheck.forEach((pos) => {
    asyncTasks.push(
      queue.add(async () => {
        await processPos(pos);
      }),
    );
  });

  await Promise.all(asyncTasks);

  const totalFailed = Object.values(countryStats).reduce(
    (sum, s) => sum + s.failed,
    0,
  );

  captureBatchSummary({
    apiType,
    totalStores: posToCheck.length,
    successCount: posToCheck.length - totalFailed,
    failedCount: totalFailed,
    countryBreakdown: countryStats,
    durationMs: Date.now() - startTime,
    sampleErrors: Array.from(sampleErrors.values()),
  });

  const uniquePosArray = Array.from(posMap.values());

  await updatePos(uniquePosArray);

  return null;
}
