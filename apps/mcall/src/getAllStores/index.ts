import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'
import { refreshStoreCatalog } from '@mcbroken/mclogik/storeCatalogRefresh'
import { APIType } from '@mcbroken/mclogik/types'

initSentry({ region: 'eu' })

export const handler = wrapHandler(async () => {
  const refreshResults = await Promise.allSettled([
    refreshStoreCatalog({ apiType: APIType.EU }),
    refreshStoreCatalog({ apiType: APIType.EL })
  ])

  for (const result of refreshResults) {
    if (result.status === 'rejected') {
      throw result.reason
    }
  }

  return {
    statusCode: 200,
    success: true,
  }
})
