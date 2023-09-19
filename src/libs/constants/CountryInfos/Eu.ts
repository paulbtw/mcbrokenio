import { APIType, type ICountryInfos, IceType, EuLocations } from '@libs/types'

export const Eu: Record<EuLocations, ICountryInfos> = {
  // EU-PROD API
  [EuLocations.DE]: {
    country: EuLocations.DE,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5000', '5010', '5020'],
      [IceType.MCFLURRY]: ['4237', '4252', '4255', '4256', '4258'],
      [IceType.MCSUNDAE]: ['4603', '4604', '4651']
    },
    locationLimits: {
      minLatitude: 47.270111,
      maxLatitude: 55.05814,
      minLongitude: 5.866315,
      maxLongitude: 15.041896
    }
  },
  [EuLocations.NL]: {
    // Has no mobile ordering
    country: EuLocations.NL,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    },
    locationLimits: {
      minLatitude: 51.278,
      maxLatitude: 53.554,
      minLongitude: 3.021,
      maxLongitude: 7.227
    }
  },
  [EuLocations.UK]: {
    country: EuLocations.UK,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4300', '4310', '4330', '4320'],
      [IceType.MCFLURRY]: ['4467', '4694', '4397', '6554'],
      [IceType.MCSUNDAE]: ['UNAVAILABLE']
    },
    locationLimits: {
      minLatitude: 49.674,
      maxLatitude: 59.454,
      minLongitude: -8.649,
      maxLongitude: 1.763
    }
  }
}
