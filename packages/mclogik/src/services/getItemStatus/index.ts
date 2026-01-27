import { type Pos, prisma } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'
import PQueue from 'p-queue'

import { type RequestLimiter } from '../../constants/RateLimit'
import { type APIType, type ICountryInfos,type Locations, type UpdatePos } from '../../types'
import { getMetaForApi } from '../../utils/getMetaForApi'
import { getPosByCountries } from '../../utils/getPosByCountries'

import { getItemStatusMap } from './getItemStatus/index'
import { getFailedPos, getUpdatedPos } from './getUpdatedPos'
import { updatePos } from './updatePos'

const logger = new Logger('getItemStatus')

export async function getItemStatus(
  apiType: APIType,
  requestLimiter: RequestLimiter,
  countryList?: Locations[]
) {
  const queue = new PQueue({
    concurrency: requestLimiter.concurrentRequests
  })

  const asyncTasks: Array<Promise<void>> = []
  const posMap = new Map<string, UpdatePos>()

  const requestsPerLog = requestLimiter.requestsPerLog
  const maxRequestsPerSecond = requestLimiter.maxRequestsPerSecond
  let requestsThisSecond = 0
  let totalRequestsProcessed = 0

  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true
  )
  const countries = countryInfos.map((countryInfo) => countryInfo.country)
  const countriesRecord = countryInfos.reduce<Record<string, ICountryInfos>>((acc, countryInfo) => {
    acc[countryInfo.country] = countryInfo
    return acc
  }, {})

  async function processPos(pos: Pos) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay 1 second
      requestsThisSecond = 0
    }

    requestsThisSecond++
    totalRequestsProcessed++

    if (totalRequestsProcessed % requestsPerLog === 0) {
      logger.debug(`Processed ${totalRequestsProcessed}`)
    }

    const itemStatus = await getItemStatusMap[apiType](
      pos,
      countriesRecord,
      token,
      clientId
    )

    if (itemStatus == null) {
      // API call failed - track the failure
      const failedPosUpdate = getFailedPos(pos)
      posMap.set(pos.id, failedPosUpdate)

      // Log when a store transitions to unresponsive
      if (pos.isResponsive && !failedPosUpdate.isResponsive) {
        logger.warn(
          `Store ${pos.id} (${pos.name}) marked as unresponsive after ${failedPosUpdate.errorCounter} consecutive failures`
        )
      }
      return
    }

    // API call succeeded - reset error counter and update status
    const posToUpdate = getUpdatedPos(pos, itemStatus)
    posMap.set(pos.id, posToUpdate)
  }

  const posToCheck = await getPosByCountries(prisma, countries)

  logger.info(`Found ${posToCheck.length} pos to check`)

  if (posToCheck.length === 0) {
    return
  }

  posToCheck.forEach((pos) => {
    asyncTasks.push(queue.add(async () => { await processPos(pos) }))
  })

  await Promise.all(asyncTasks)

  const uniquePosArray = Array.from(posMap.values())

  await updatePos(uniquePosArray)

  return null
}
