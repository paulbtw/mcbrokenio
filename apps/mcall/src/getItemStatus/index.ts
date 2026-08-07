import { pollAvailability } from '@mcbroken/mclogik/availabilityPolling'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'eu' })

export const handlerEu = wrapHandler(async () => {
  await pollAvailability({ apiType: APIType.EU })

  return {
    statusCode: 200,
    success: true,
  }
})

export const handlerEl = wrapHandler(async () => {
  await pollAvailability({ apiType: APIType.EL })

  return {
    statusCode: 200,
    success: true,
  }
})
