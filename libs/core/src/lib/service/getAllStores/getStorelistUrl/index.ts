import PQueue from 'p-queue';
import { APIType, CreatePos, Locations } from '../../../types';
import { getMetaForApi } from '../../../utils/getMetaForApi';
import { getStorelistFromUrl } from './getStorelistFromUrl';
import { savePos } from '../savePos';

const queue = new PQueue({ concurrency: 2, interval: 500 });

export async function getStorelistWithUrl(
  apiType: APIType,
  countryList?: Locations[],
) {
  const { countryInfos } = await getMetaForApi(apiType, countryList, false);

  const posMap = new Map<string, CreatePos>();
  const asyncTasks: Promise<void>[] = [];

  countryInfos.forEach((countryInfo) => {
    asyncTasks.push(
      queue.add(async () => {
        const pos = await getStorelistFromUrl(countryInfo);

        if (pos.length > 0) {
          pos.map((p) => {
            if (!posMap.has(p.nationalStoreNumber)) {
              posMap.set(p.nationalStoreNumber, p);
            }
          });
        }
      }),
    );
  });

  await Promise.all(asyncTasks);

  const uniquePosArray = Array.from(posMap.values());

  await savePos(uniquePosArray);
}
