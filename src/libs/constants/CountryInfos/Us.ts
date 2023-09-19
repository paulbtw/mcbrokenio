import { type ICountryInfos, APIType, IceType, UsLocations } from '@libs/types'

export const Us: Record<UsLocations, ICountryInfos> = {
  // US-PROD API
  // Only works with USA IP
  [UsLocations.CA]: {
    country: UsLocations.CA,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1125', '1126', '1127', '16813'],
      [IceType.MCFLURRY]: ['16804', '16763', '5229', '11678'],
      [IceType.MCSUNDAE]: ['132', '133']
    },
    locationLimits: {
      minLatitude: 41.676,
      maxLatitude: 69.529,
      minLongitude: -141.001,
      maxLongitude: -52.617
    }
  },
  [UsLocations.US]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 40.000000,
      maxLatitude: 49.384358,
      minLongitude: -125.000000,
      maxLongitude: -100.000000
    }
  },
  [UsLocations.US2]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 24.396308,
      maxLatitude: 40.000000,
      minLongitude: -125.000000,
      maxLongitude: -100.000000
    }
  },
  [UsLocations.US3]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 40.000000,
      maxLatitude: 49.384358,
      minLongitude: -100.000000,
      maxLongitude: -66.934570
    }
  },
  [UsLocations.US4]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 24.396308,
      maxLatitude: 40.000000,
      minLongitude: -100.000000,
      maxLongitude: -66.934570
    }
  },
  [UsLocations.US5]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 51.209667,
      maxLatitude: 71.538800,
      minLongitude: -179.148909,
      maxLongitude: -130.005746
    }
  },
  [UsLocations.US6]: {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478']
    },
    locationLimits: {
      minLatitude: 18.776300,
      maxLatitude: 28.402123,
      minLongitude: -160.236328,
      maxLongitude: -154.806717
    }
  }
}
