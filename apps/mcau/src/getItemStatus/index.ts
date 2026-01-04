import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType } from '@mcbroken/mclogik/types'

export const handler = async () => {
  try {
    await getItemStatus(APIType.AP, defaultRequestLimiterAu)

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
