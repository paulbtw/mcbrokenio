import { createJson } from '@mcbroken/mclogik/createJson';

export const handler = async () => {
  try {
    await createJson()

    return {
      statusCode: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in createJson handler:', errorMessage, error)

    // Throw to let Lambda handle retries for scheduled events
    throw error
  }
}
