import { defaultRequestLimiterUs } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

export const handler = async (event?: { countryList?: Locations[] }) => {
  try {
    await getItemStatus(APIType.US, defaultRequestLimiterUs, event?.countryList)

    return {
      statusCode: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in getItemStatus handler:', errorMessage, error)

    // Throw to let Lambda handle retries for scheduled events
    throw error
  }
}
