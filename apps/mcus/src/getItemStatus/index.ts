import { defaultRequestLimiterUs } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'us' })

export const handler = wrapHandler(async (event?: { countryList?: Locations[] }) => {
  await getItemStatus(APIType.US, defaultRequestLimiterUs, event?.countryList)

  return {
    statusCode: 200,
    success: true,
  }
})
