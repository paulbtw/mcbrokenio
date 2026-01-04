import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType } from '@mcbroken/mclogik/types'

export const handlerEu = async () => {
  try {
    await getItemStatus(APIType.EU, defaultRequestLimiterEu)

    return {
      statusCode: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in getItemStatus handlerEu:', errorMessage, error)

    // Throw to let Lambda handle retries for scheduled events
    throw error
  }
}

export const handlerEl = async () => {
  try {
    await getItemStatus(APIType.EL, defaultRequestLimiterEu)

    return {
      statusCode: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in getItemStatus handlerEl:', errorMessage, error)

    // Throw to let Lambda handle retries for scheduled events
    throw error
  }
}
