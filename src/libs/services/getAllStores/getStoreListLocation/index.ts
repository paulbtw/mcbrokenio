import PQueue from 'p-queue'
import { getMetaForApi } from '@libs/utils/getMetaForApi'
import {
  type APIType,
  type CreatePos,
  type ICountryInfos,
  type ILocation,
  type Locations
} from '@libs/types'
import { generateCoordinatesMesh } from '@libs/utils/generateCoordinatesMesh'
import { Logger } from '@sailplane/logger'
import { defaultRequestLimiterAu } from '@libs/constants/RateLimit'
import { savePos } from '@libs/services/getAllStores/savePos'
import { getStorelistFromLocation } from '@libs/services/getAllStores/getStoreListLocation/getStorelistFromLocation'

const logger = new Logger({
  logTimestamps: true,
  module: 'getStoreListLocation'
})

export async function getStorelistWithLocation(
  apiType: APIType,
  intervalKilometer: number,
  requestLimiter = defaultRequestLimiterAu,
  countryList?: Locations[]
) {
  const queue = new PQueue({
    concurrency: requestLimiter.concurrentRequests
  })

  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true
  )

  const posMap = new Map<string, CreatePos>()
  const posArray: CreatePos[][] = []
  const asyncTasks: Array<Promise<void>> = []

  const requestsPerLog = requestLimiter.requestsPerLog
  const maxRequestsPerSecond = requestLimiter.maxRequestsPerSecond
  let requestsThisSecond = 0
  let totalRequestsProcessed = 0

  async function processLocation(
    location: ILocation,
    countryInfo: ICountryInfos
  ) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay 1 second
      requestsThisSecond = 0
    }

    requestsThisSecond++

    const pos = await getStorelistFromLocation(
      location,
      countryInfo,
      token,
      clientId
    )

    if (pos.length > 0) {
      posArray.push(pos)
      pos.forEach((p) => {
        if (!posMap.has(p.nationalStoreNumber)) {
          posMap.set(p.nationalStoreNumber, p)
        }
      })
    }

    totalRequestsProcessed++

    if (totalRequestsProcessed % requestsPerLog === 0) {
      logger.debug(`Processed ${totalRequestsProcessed}`)
    }
  }

  countryInfos.forEach((countryInfo) => {
    if (countryInfo.country === 'UK') {
      return
    }

    const locationLimits = countryInfo.locationLimits

    if (locationLimits == null) {
      throw new Error(`No locations found for ${countryInfo.country}`)
    }

    const locations = generateCoordinatesMesh(
      locationLimits,
      intervalKilometer
    )

    locations.forEach((location) => {
      asyncTasks.push(queue.add(async () => { await processLocation(location, countryInfo) }))
    })
  })

  await Promise.all(asyncTasks)

  const uniquePosArray = Array.from(posMap.values())

  await savePos(uniquePosArray)

  return null
}
