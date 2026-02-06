import { Logger } from '@sailplane/logger'

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
import { createRateLimitedExecutor } from '../../../utils/RateLimitedExecutor'
import { savePos } from '../savePos'

import { getStorelistFromLocation } from './getStorelistFromLocation'

const logger = new Logger({
  logTimestamps: true,
  module: 'getStoreListLocation'
})

interface LocationTask {
  location: ILocation
  countryInfo: ICountryInfos
}

export async function getStorelistWithLocation(
  apiType: APIType,
  intervalKilometer: number,
  requestLimiter = defaultRequestLimiterAu,
  countryList?: Locations[]
) {
  const { token, clientId, countryInfos } = await getMetaForApi(
    apiType,
    countryList,
    true
  )

  const tasks: LocationTask[] = []

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
      tasks.push({ location, countryInfo })
    })
  })

  const executor = createRateLimitedExecutor(requestLimiter, 'getStoreListLocation')

  const { results, failures } = await executor.executeAll<LocationTask, CreatePos[]>(
    tasks,
    async ({ location, countryInfo }) => {
      const pos = await getStorelistFromLocation(
        location,
        countryInfo,
        token,
        clientId
      )
      return pos.length > 0 ? pos : null
    }
  )

  logger.info(`ErrorCount ${failures}`)

  const posMap = new Map<string, CreatePos>()
  results.flat().forEach((p) => {
    if (!posMap.has(p.nationalStoreNumber)) {
      posMap.set(p.nationalStoreNumber, p)
    }
  })

  const uniquePosArray = Array.from(posMap.values())

  await savePos(uniquePosArray)

  return null
}
