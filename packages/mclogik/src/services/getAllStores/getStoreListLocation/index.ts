import { Logger } from '@sailplane/logger'
import axios from 'axios'
import PQueue from 'p-queue'

import { defaultRequestLimiterAu } from '../../../constants/RateLimit'
import {
  type APIType,
  type CreatePos,
  type ICountryInfos,
  type ILocation,
  type Locations
  } from '../../../types'
import { generateCoordinatesMesh } from '../../../utils/generateCoordinatesMesh'
import { getMetaForApi } from '../../../utils/getMetaForApi'
import { savePos } from '../savePos'

import { getStorelistFromLocation } from './getStorelistFromLocation'

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
  let errorCount = 0

  async function processLocation(
    location: ILocation,
    countryInfo: ICountryInfos
  ) {
    if (requestsThisSecond >= maxRequestsPerSecond) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay 1 second
      requestsThisSecond = 0
    }

    requestsThisSecond++

    try {
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
    } catch (error) {
      errorCount++
      if (axios.isAxiosError(error)) {
        const axiosError = error

        if (axiosError.response?.status === 401) {
          logger.warn('Bad request error')
        }
      }
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

  logger.info(`ErrorCount ${errorCount}`)

  const uniquePosArray = Array.from(posMap.values())

  await savePos(uniquePosArray)

  return null
}
