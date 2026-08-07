import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { refreshStoreCatalog } from '@mcbroken/mclogik/storeCatalogRefresh'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

initSentry({ region: 'au' })

export const handler = wrapHandler(async (event?: { countries?: Locations[] }) => {
  await refreshStoreCatalog({
    apiType: APIType.AP,
    countryList: event?.countries
  })

  return {
    statusCode: 200,
    success: true,
  }
})
