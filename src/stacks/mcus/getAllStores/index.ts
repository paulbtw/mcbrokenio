import { defaultRequestLimiterUs } from '@libs/constants/RateLimit'
import { getStorelistWithLocation } from '@libs/services/getAllStores/getStoreListLocation'
import { APIType, type Locations } from '@libs/types'
import { type Handler } from 'aws-lambda'

export const handler: Handler<{ countries?: Locations[] }> = async (event) => {
  await getStorelistWithLocation(APIType.US, 30, defaultRequestLimiterUs, event.countries)

  return null
}
