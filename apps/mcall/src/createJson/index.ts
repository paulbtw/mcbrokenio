import { publishAvailabilitySnapshot } from '@mcbroken/mclogik/publishedAvailabilitySnapshot'
import { initSentry, wrapHandler } from '@mcbroken/mclogik/sentry'

initSentry({ region: 'eu' })

export const handler = wrapHandler(async () => {
  await publishAvailabilitySnapshot()

  return {
    statusCode: 200,
    success: true,
  }
})
