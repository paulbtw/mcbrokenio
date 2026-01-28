import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'au' })

export const handler = wrapHandler(async () => {
  await getItemStatus(APIType.AP, defaultRequestLimiterAu)

  return {
    statusCode: 200,
    success: true,
  }
})
