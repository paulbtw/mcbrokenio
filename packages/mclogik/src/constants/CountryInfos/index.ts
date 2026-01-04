import { APIType, IceType,type ICountryInfos, type Locations, UnknownLocations } from '../../types'

import { Ap } from './Ap'
import { El } from './El'
import { Eu } from './Eu'
import { Us } from './Us'

export const CountryInfos = {
  ...Ap,
  ...El,
  ...Eu,
  ...Us,
  [UnknownLocations.UNKNOWN]: {
    country: UnknownLocations.UNKNOWN,
    getStores: {
      api: APIType.UNKNOWN,
      url: ''
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  }
} as unknown as Record<Locations, ICountryInfos>

