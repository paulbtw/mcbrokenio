import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation } from '@mcbroken/mclogik/getAllStores'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'au' })

export const handler = wrapHandler(async (event: { countries?: Locations[] }) => {
  await getStorelistWithLocation(APIType.AP, 30, defaultRequestLimiterAu, event.countries)

  return {
    statusCode: 200,
    success: true,
  }
})
