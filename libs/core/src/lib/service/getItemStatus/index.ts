import { APIType, ICountryInfos, Locations, UpdatePos } from '../../types';
import { Logger } from '@sailplane/logger';
import PQueue from 'p-queue';
import { defaultRequestLimiterAu } from '../../constants/RateLimit';
import { getMetaForApi } from '../../utils/getMetaForApi';
import { createPrismaClient } from '@mcbroken/db';
import { Pos } from '@prisma/client';
import { getPosByCountries } from '../../utils/getPosByCountries';
import { getUpdatedPos } from './getUpdatedPos';
import { updatePos } from './updatePos';

const logger = new Logger('getItemStatus');

export async function getItemStatus(
  apiType: APIType,
  requestLimiter = defaultRequestLimiterAu,
  countryList?: Locations[],
) {
  const prisma = createPrismaClient();

  const queue = new PQueue({
    concurrency: requestLimiter.concurrentRequests,
  });

  const asyncTasks: Promise<void>[] = [];
  const posMap = new Map<string, UpdatePos>();

  const requestsPerLog = requestLimiter.requestsPerLog;
  const maxRequestsPerSecond = requestLimiter.maxRequestsPerSecond;
  let requestsThisSecond = 0;
  let totalRequestsProcessed = 0;

  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true,
  );
  const countries = countryInfos.map((countryInfo) => countryInfo.country);
  const countriesRecord = countryInfos.reduce((acc, countryInfo) => {
    acc[countryInfo.country] = countryInfo;
    return acc;
  }, {} as Record<string, ICountryInfos>);

  async function processPos(pos: Pos) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 second
      requestsThisSecond = 0;
    }

    requestsThisSecond++;
    totalRequestsProcessed++;

    if (totalRequestsProcessed % requestsPerLog === 0) {
      logger.debug(`Processed ${totalRequestsProcessed}`);
    }

    const itemStatus = await getItemStatus[apiType](
      pos,
      countriesRecord,
      token,
      clientId,
    );

    if (!itemStatus) {
      return;
    }

    const posToUpdate = getUpdatedPos(pos, itemStatus);

    posMap.set(pos.id, posToUpdate);
  }

  const posToCheck = await getPosByCountries(prisma, countries);

  logger.info(`Found ${posToCheck.length} pos to check`);

  if (posToCheck.length === 0) {
    return;
  }

  posToCheck.map((pos) => {
    asyncTasks.push(queue.add(() => processPos(pos)));
  });

  await Promise.all(asyncTasks);

  const uniquePosArray = Array.from(posMap.values());

  await updatePos(uniquePosArray);

  return null;
}
