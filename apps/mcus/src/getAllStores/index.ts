import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { refreshStoreCatalog } from '@mcbroken/mclogik/storeCatalogRefresh'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'us' })

export const handler = wrapHandler(async (event?: { countries?: Locations[] }) => {
  await refreshStoreCatalog({
    apiType: APIType.US,
    countryList: event?.countries
  })

  return {
    statusCode: 200,
    success: true,
  }
})
