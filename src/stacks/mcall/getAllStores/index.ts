import { defaultRequestLimiterEu } from '@libs/constants/RateLimit'
import { getStorelistWithLocation } from '@libs/services/getAllStores/getStoreListLocation'
import { getStorelistWithUrl } from '@libs/services/getAllStores/getStorelistUrl'
import { APIType } from '@libs/types'

export const handler = async () => {
  await getStorelistWithLocation(APIType.EU, 50, defaultRequestLimiterEu)
  await getStorelistWithUrl(APIType.EL)

  return null
}
