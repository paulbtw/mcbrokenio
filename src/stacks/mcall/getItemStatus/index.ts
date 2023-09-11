import { defaultRequestLimiterEu } from '@libs/constants/RateLimit'
import { getItemStatus } from '@libs/services/getItemStatus'
import { APIType } from '@libs/types'

export const handler = async () => {
  await getItemStatus(APIType.EU, defaultRequestLimiterEu)

  return null
}
