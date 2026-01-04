import { defaultRequestLimiterAu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType } from '@mcbroken/mclogik/types'

export const handler = async () => {
  await getItemStatus(APIType.AP, defaultRequestLimiterAu)

  return null
}
