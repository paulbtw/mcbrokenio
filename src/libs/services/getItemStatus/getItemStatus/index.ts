import { getItemStatusAu } from '@libs/services/getItemStatus/getItemStatus/getItemStatusAu'
import { getItemStatusEl } from '@libs/services/getItemStatus/getItemStatus/getItemStatusEl'
import { type GetItemStatus, getItemStatusEu } from '@libs/services/getItemStatus/getItemStatus/getItemStatusEu'
import { getItemStatusUs } from '@libs/services/getItemStatus/getItemStatus/getItemStatusUs'
import { APIType, type ICountryInfos } from '@libs/types'
import { type Pos } from '@prisma/client'

export const getItemStatusMap: Record<
APIType,
(
  pos: Pos,
  countriesRecord: Record<string, ICountryInfos>,
  token: string,
  clientId: string,
) => Promise<GetItemStatus | null>
> = {
  [APIType.AP]: getItemStatusAu,
  [APIType.EL]: getItemStatusEl,
  [APIType.EU]: getItemStatusEu,
  [APIType.HK]: () => {
    throw new Error('Not implemented')
  },
  [APIType.UNKNOWN]: () => {
    throw new Error('Not implemented')
  },
  [APIType.US]: getItemStatusUs
}
