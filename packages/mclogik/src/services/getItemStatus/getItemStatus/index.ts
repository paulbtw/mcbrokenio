import { type Pos } from '@mcbroken/db'

import { APIType, type ICountryInfos } from '../../../types'

import { getItemStatusAu } from './getItemStatusAu'
import { getItemStatusEl } from './getItemStatusEl'
import { type GetItemStatus, getItemStatusEu } from './getItemStatusEu'
import { getItemStatusUs } from './getItemStatusUs'

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
