import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation, getStorelistWithUrl } from '@mcbroken/mclogik/getAllStores'
import { APIType } from '@mcbroken/mclogik/types'

export const handler = async () => {
  await getStorelistWithLocation(APIType.EU, 50, defaultRequestLimiterEu)
  await getStorelistWithUrl(APIType.EL)

  return null
}
