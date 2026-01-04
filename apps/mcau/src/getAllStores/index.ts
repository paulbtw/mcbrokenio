import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation } from '@mcbroken/mclogik/getAllStores'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

export const handler = async (event: { countries?: Locations[] }) => {
  await getStorelistWithLocation(APIType.AP, 30, defaultRequestLimiterAu, event.countries)

  return null
}
