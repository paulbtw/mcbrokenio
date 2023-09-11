import { getStorelistFromUrl } from '@libs/services/getAllStores/getStorelistUrl/getStorelistFromUrl'
import { savePos } from '@libs/services/getAllStores/savePos'
import { type APIType, type CreatePos, type Locations } from '@libs/types'
import { getMetaForApi } from '@libs/utils/getMetaForApi'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 2, interval: 500 })

export async function getStorelistWithUrl(
  apiType: APIType,
  countryList?: Locations[]
) {
  const { countryInfos } = await getMetaForApi(apiType, countryList, false)

  const posMap = new Map<string, CreatePos>()
  const asyncTasks: Array<Promise<void>> = []

  countryInfos.forEach((countryInfo) => {
    asyncTasks.push(
      queue.add(async () => {
        const pos = await getStorelistFromUrl(countryInfo)

        if (pos != null && pos.length > 0) {
          pos.forEach((p) => {
            if (!posMap.has(p.nationalStoreNumber)) {
              posMap.set(p.nationalStoreNumber, p)
            }
          })
        }
      })
    )
  })

  await Promise.all(asyncTasks)

  const uniquePosArray = Array.from(posMap.values())

  await savePos(uniquePosArray)
}
