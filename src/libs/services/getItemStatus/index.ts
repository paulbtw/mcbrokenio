import { Logger } from '@sailplane/logger'
import PQueue from 'p-queue'
import { type Pos } from '@prisma/client'
import { type RequestLimiter } from '@libs/constants/RateLimit'
import { type Locations, type APIType, type UpdatePos, type ICountryInfos } from '@libs/types'
import { createPrismaClient } from '@libs/utils/createPrismaClient'
import { getMetaForApi } from '@libs/utils/getMetaForApi'
import { getItemStatusMap } from '@libs/services/getItemStatus/getItemStatus'
import { getUpdatedPos } from '@libs/services/getItemStatus/getUpdatedPos'
import { getPosByCountries } from '@libs/utils/getPosByCountries'
import { updatePos } from '@libs/services/getItemStatus/updatePos'

const logger = new Logger('getItemStatus')

export async function getItemStatus(
  apiType: APIType,
  requestLimiter: RequestLimiter,
  countryList?: Locations[]
) {
  const prisma = createPrismaClient()

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
      return
    }

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
