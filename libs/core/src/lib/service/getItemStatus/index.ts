import axios, { AxiosError } from 'axios';
import { APIType, Locations } from '../../types';
import { Logger } from '@sailplane/logger';
import PQueue from 'p-queue';
import { defaultRequestLimiterAu } from '../../constants/RateLimit';
import { getMetaForApi } from '../../utils/getMetaForApi';
import { createPrismaClient } from '@mcbroken/db';

const logger = new Logger('getItemStatus');

export async function getItemStatus(
  apiType: APIType,
  requestLimiter = defaultRequestLimiterAu,
  countryList?: Locations[],
) {
  const queue = new PQueue({
    concurrency: requestLimiter.concurrentRequests,
  });

  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true,
  );
  const countries = countryInfos.map((countryInfo) => countryInfo.country);

  try {
    const prisma = createPrismaClient();

    const posToCheck = await prisma.pos.findMany({
      where: {
        country: {
          in: countries,
        },
      },
      take: 2000,
      orderBy: {
        updatedAt: 'asc',
      },
    });

    logger.info('Pos Count: ', posToCheck.length);
  } catch (error) {
    // check if error is AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        logger.warn(`Bad requed error`);
      } else {
        logger.error(`Error while getting store status `);
      }
    }

    logger.error('Error while getting stores for location, no axios error');
  }
}
