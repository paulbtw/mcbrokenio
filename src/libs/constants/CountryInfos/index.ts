import { Ap } from '@libs/constants/CountryInfos/Ap'
import { El } from '@libs/constants/CountryInfos/El'
import { Eu } from '@libs/constants/CountryInfos/Eu'
import { Us } from '@libs/constants/CountryInfos/Us'
import { UnknownLocations, type ICountryInfos, type Locations, APIType, IceType } from '@libs/types'

export const CountryInfos: Record<Locations, ICountryInfos> = {
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
}
