import { defaultRequestLimiterEu } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType } from '@mcbroken/mclogik/types'

export const handlerEu = async () => {
  await getItemStatus(APIType.EU, defaultRequestLimiterEu)

  return null
}

export const handlerEl = async () => {
  await getItemStatus(APIType.EL, defaultRequestLimiterEu)

  return null
}
