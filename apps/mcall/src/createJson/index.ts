import { createJson } from '@mcbroken/mclogik/createJson'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'

initSentry({ region: 'eu' })

export const handler = wrapHandler(async () => {
  await createJson()

  return {
    statusCode: 200,
    success: true,
  }
})
