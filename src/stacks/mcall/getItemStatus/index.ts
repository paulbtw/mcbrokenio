import { defaultRequestLimiterEu } from '@libs/constants/RateLimit'
import { getItemStatus } from '@libs/services/getItemStatus'
import { APIType } from '@libs/types'

export const handlerEu = async () => {
  await getItemStatus(APIType.EU, defaultRequestLimiterEu)

  return null
}

export const handlerEl = async () => {
  await getItemStatus(APIType.EL, defaultRequestLimiterEu)

  return null
}
