import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'eu' })

export const handlerEu = wrapHandler(async () => {
  await getItemStatus(APIType.EU, defaultRequestLimiterEu)

  return {
    statusCode: 200,
    success: true,
  }
})

export const handlerEl = wrapHandler(async () => {
  await getItemStatus(APIType.EL, defaultRequestLimiterEu)

  return {
    statusCode: 200,
    success: true,
  }
})
