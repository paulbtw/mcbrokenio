import { pollAvailability } from '@mcbroken/mclogik/availabilityPolling'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'us' })

export const handler = wrapHandler(async (event?: { countryList?: Locations[] }) => {
  await pollAvailability({
    apiType: APIType.US,
    countryList: event?.countryList
  })

  return {
    statusCode: 200,
    success: true,
  }
})
