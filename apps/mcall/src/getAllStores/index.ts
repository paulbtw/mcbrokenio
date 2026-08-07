import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { refreshStoreCatalog } from '@mcbroken/mclogik/storeCatalogRefresh'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'eu' })

export const handler = wrapHandler(async () => {
  await refreshStoreCatalog({ apiType: APIType.EU })
  await refreshStoreCatalog({ apiType: APIType.EL })

  return {
    statusCode: 200,
    success: true,
  }
})
