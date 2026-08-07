import { pollAvailability } from '@mcbroken/mclogik/availabilityPolling'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'au' })

export const handler = wrapHandler(async () => {
  await pollAvailability({ apiType: APIType.AP })

  return {
    statusCode: 200,
    success: true,
  }
})
