import { defaultRequestLimiterAu } from '@libs/constants/RateLimit'
import { getStorelistWithLocation } from '@libs/services/getAllStores/getStoreListLocation'
import { APIType, type Locations } from '@libs/types'
import { type Handler } from 'aws-lambda'

export const handler: Handler<{ countries?: Locations[] }> = async (event) => {
  await getStorelistWithLocation(APIType.AP, 30, defaultRequestLimiterAu, event.countries)

  return null
}
