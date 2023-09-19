import { type ICountryInfos, APIType, IceType, ApLocations } from '@libs/types'

export const Ap: Record<ApLocations, ICountryInfos> = {
  // AP-PROD API
  [ApLocations.AU]: {
    country: ApLocations.AU,
    getStores: {
      api: APIType.AP,
      url: 'https://ap-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1502', '1512', '1522'],
      [IceType.MCFLURRY]: ['5739', '5738'],
      [IceType.MCSUNDAE]: ['30001', '30002', '30003', '30004']
    },
    customItems: {
      fantaRaspberry: ['2337', '2338', '2339'],
      fantaMango: ['3319', '3336', '3534'],
      fantaGrape: ['3474', '3475', '3480'],
      fantaBlueberry: ['3409', '3410', '3414'],
      frozenCoke: ['265', '266', '6081'],
      frozenCokeZero: ['15029', '15030', '15031']
    },
    locationLimits: {
      minLatitude: -23.648618,
      maxLatitude: -9.219482,
      minLongitude: 112.9211,
      maxLongitude: 153.6382
    }
  },
  [ApLocations.AU2]: {
    country: ApLocations.AU,
    getStores: {
      api: APIType.AP,
      url: 'https://ap-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1502', '1512', '1522'],
      [IceType.MCFLURRY]: ['5739', '5738'],
      [IceType.MCSUNDAE]: ['30001', '30002', '30003', '30004']
    },
    customItems: {
      fantaRaspberry: ['2337', '2338', '2339'],
      fantaMango: ['3319', '3336', '3534'],
      fantaGrape: ['3474', '3475', '3480'],
      fantaBlueberry: ['3409', '3410', '3414'],
      frozenCoke: ['265', '266', '6081'],
      frozenCokeZero: ['15029', '15030', '15031']
    },
    locationLimits: {
      minLatitude: -43.648618,
      maxLatitude: -23.648618,
      minLongitude: 112.9211,
      maxLongitude: 153.6382
    }
  },

  // AP API
  [ApLocations.HK]: {
    country: ApLocations.HK,
    getStores: {
      api: APIType.HK,
      url: 'https://ap.api.mcd.com/v3/restaurant/location?filter=search&query=%7B%22market%22%3A%22HK%22,%22storeAttributes%22%3A%5B%5D,%22pageSize%22%3A500,%22local%22%3A%22en-HK%22,%22locationCriteria%22%3A%7B%22distance%22%3A%225000%22,%22longitude%22%3A%22114.108436%22,%22latitude%22%3A%2222.352316%22%7D%7D',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4325', '4326', '4320'],
      [IceType.MCFLURRY]: ['22794', '1528'],
      [IceType.MCSUNDAE]: ['4448', '4449']
    }
  }
}
