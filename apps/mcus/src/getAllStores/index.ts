import { defaultRequestLimiterUs } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation } from '@mcbroken/mclogik/getAllStores'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'us' })

export const handler = wrapHandler(async (event: { countries?: Locations[] }) => {
  await getStorelistWithLocation(APIType.US, 30, defaultRequestLimiterUs, event.countries)

  return {
    statusCode: 200,
    success: true,
  }
})
