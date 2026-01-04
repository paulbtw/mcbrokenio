import { defaultRequestLimiterAu } from '@libs/constants/RateLimit'
import { getItemStatus } from '@libs/services/getItemStatus'
import { APIType } from '@libs/types'

export const handler = async () => {
  await getItemStatus(APIType.AP, defaultRequestLimiterAu)

  return null
}
