import { defaultRequestLimiterUs } from '@mcbroken/mclogik/constants'
import { getItemStatus } from '@mcbroken/mclogik/getItemStatus'
import { APIType, type Locations } from '@mcbroken/mclogik/types'

export const handler = async (event?: { countryList?: Locations[] }) => {
  await getItemStatus(APIType.US, defaultRequestLimiterUs, event?.countryList)

  return null
}
