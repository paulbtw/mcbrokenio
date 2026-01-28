import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation, getStorelistWithUrl } from '@mcbroken/mclogik/getAllStores'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'eu' })

export const handler = wrapHandler(async () => {
  await getStorelistWithLocation(APIType.EU, 50, defaultRequestLimiterEu)
  await getStorelistWithUrl(APIType.EL)

  return {
    statusCode: 200,
    success: true,
  }
})
