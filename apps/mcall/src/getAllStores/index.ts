import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation, getStorelistWithUrl } from '@mcbroken/mclogik/getAllStores'
import { APIType } from '@mcbroken/mclogik/types'

export const handler = async () => {
  try {
    await getStorelistWithLocation(APIType.EU, 50, defaultRequestLimiterEu)
    await getStorelistWithUrl(APIType.EL)

    return {
      statusCode: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in getAllStores handler:', errorMessage, error)

    // Throw to let Lambda handle retries for scheduled events
    throw error
  }
}
