import { type Pos, prisma } from '@mcbroken/db'
import PQueue from 'p-queue'

import { type RequestLimiter } from '../../constants/RateLimit'
import { addBreadcrumb, captureBatchSummary } from '../../sentry'
import { type APIType, type ICountryInfos,type Locations, type UpdatePos } from '../../types'
import { getMetaForApi } from '../../utils/getMetaForApi'
import { getPosByCountries } from '../../utils/getPosByCountries'

import { getItemStatusMap } from './getItemStatus/index'
import { getFailedPos, getUpdatedPos } from './getUpdatedPos'
import { updatePos } from './updatePos'

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
  const countryStats: Record<string, { total: number; failed: number }> = {}
  const startTime = Date.now()

  const maxRequestsPerSecond = requestLimiter.maxRequestsPerSecond
  let requestsThisSecond = 0

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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      requestsThisSecond = 0
    }

    requestsThisSecond++

    // Track per-country stats
    const country = pos.country
    if (!countryStats[country]) {
      countryStats[country] = { total: 0, failed: 0 }
    }
    countryStats[country].total++

    const itemStatus = await getItemStatusMap[apiType](
      pos,
      countriesRecord,
      token,
      clientId
    )

    if (itemStatus == null) {
      countryStats[country].failed++

      const failedPosUpdate = getFailedPos(pos)
      posMap.set(pos.id, failedPosUpdate)
      return
    }

    const posToUpdate = getUpdatedPos(pos, itemStatus)
    posMap.set(pos.id, posToUpdate)
  }

  const posToCheck = await getPosByCountries(prisma, countries)

  addBreadcrumb('Starting batch processing', {
    apiType,
    storeCount: posToCheck.length,
  })

  if (posToCheck.length === 0) {
    return
  }

  posToCheck.forEach((pos) => {
    asyncTasks.push(queue.add(async () => { await processPos(pos) }))
  })

  await Promise.all(asyncTasks)

  const totalFailed = Object.values(countryStats).reduce((sum, s) => sum + s.failed, 0)

  captureBatchSummary({
    apiType,
    totalStores: posToCheck.length,
    successCount: posToCheck.length - totalFailed,
    failedCount: totalFailed,
    countryBreakdown: countryStats,
    durationMs: Date.now() - startTime,
  })

  const uniquePosArray = Array.from(posMap.values())

  await updatePos(uniquePosArray)

  return null
}
