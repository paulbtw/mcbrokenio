import PQueue from 'p-queue';
import { getStorelistFromLocation } from './getStorelistFromLocation';
import { getMetaForApi } from '../../../utils/getMetaForApi';
import { APIType, CreatePos, Locations } from '../../../types';
import { savePos } from '../savePos';
import { generateCoordinatesMesh } from '../../../utils/generateCoordinatesMesh';

const queue = new PQueue({ concurrency: 3, interval: 300 });

export async function getStorelistWithLocation(
  apiType: APIType,
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

  countryInfos.forEach((countryInfo) => {
    if (countryInfo.country === 'UK') {
      return;
    }

    const locationLimits = countryInfo.locationLimits;

    if (!locationLimits) {
      throw new Error(`No locations found for ${countryInfo.country}`);
    }

    const locations = generateCoordinatesMesh(locationLimits);

    locations.forEach((location) => {
      asyncTasks.push(
        queue.add(async () => {
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
        }),
      );
    });
  });

  await Promise.all(asyncTasks);

  const posArrayFlat = posArray.flat();
  console.log(`Found ${posArrayFlat.length} stores in total.`);
  const uniquePosArray = Array.from(posMap.values());

  await savePos(uniquePosArray);

  return null;
}
