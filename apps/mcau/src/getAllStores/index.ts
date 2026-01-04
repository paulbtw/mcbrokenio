import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getStorelistWithLocation } from '@mcbroken/mclogik/getAllStores'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

export const handler = async (event: { countries?: Locations[] }) => {
  try {
    await getStorelistWithLocation(APIType.AP, 30, defaultRequestLimiterAu, event.countries)

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
