import PQueue from 'p-queue';
import { getStorelistFromLocation } from './getStorelistFromLocation';
import { getMetaForApi } from '../../../utils/getMetaForApi';
import {
  APIType,
  CreatePos,
  ICountryInfos,
  ILocation,
  Locations,
} from '../../../types';
import { savePos } from '../savePos';
import { generateCoordinatesMesh } from '../../../utils/generateCoordinatesMesh';
import { Logger } from '@sailplane/logger';

const queue = new PQueue({ concurrency: 15 });

const logger = new Logger({
  logTimestamps: true,
  module: 'getStoreListLocation',
});

export async function getStorelistWithLocation(
  apiType: APIType,
  intervalKilometer: number,
  countryList?: Locations[],
) {
  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true,
  );

  const posMap = new Map<string, CreatePos>();
  const posArray: CreatePos[][] = [];
  const asyncTasks: Promise<void>[] = [];

  const requestsPerLog = 100;
  const maxRequestsPerSecond = 10; // Maximum requests per second
  let requestsThisSecond = 0;
  let totalRequestsProcessed = 0;

  async function processLocation(
    location: ILocation,
    countryInfo: ICountryInfos,
  ) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 second
      requestsThisSecond = 0;
    }

    requestsThisSecond++;

    const pos = await getStorelistFromLocation(
      location,
      countryInfo,
      token,
      clientId,
    );

    if (pos.length > 0) {
      posArray.push(pos);
      pos.map((p) => {
        if (!posMap.has(p.nationalStoreNumber)) {
          posMap.set(p.nationalStoreNumber, p);
        }
      });
    }

    totalRequestsProcessed++;

    if (totalRequestsProcessed % requestsPerLog === 0) {
      logger.debug(`Processed ${totalRequestsProcessed}`);
    }
  }

  countryInfos.forEach((countryInfo) => {
    if (countryInfo.country === 'UK') {
      return;
    }

    const locationLimits = countryInfo.locationLimits;

    if (!locationLimits) {
      throw new Error(`No locations found for ${countryInfo.country}`);
    }

    const locations = generateCoordinatesMesh(
      locationLimits,
      intervalKilometer,
    );

    locations.forEach((location) => {
      asyncTasks.push(queue.add(() => processLocation(location, countryInfo)));
    });
  });

  await Promise.all(asyncTasks);

  const posArrayFlat = posArray.flat();
  console.log(`Found ${posArrayFlat.length} stores in total.`);
  const uniquePosArray = Array.from(posMap.values());

  await savePos(uniquePosArray);

  return null;
}
