export enum Locations {
  DE = 'DE',
  NL = 'NL',
  DK = 'DK',
  SE = 'SE',
  FI = 'FI',
  IE = 'IE',
  GB = 'GB',
  NO = 'NO',
  AT = 'AT',
  CH = 'CH',
  BE = 'BE',
  FR = 'FR',
  ES = 'ES',
  IT = 'IT',
  US = 'US',
  CA = 'CA',
  VN = 'VN',
  HR = 'HR',
  GR = 'GR',
  PT = 'PT',
  BG = 'BG',
  BA = 'BA',
  BY = 'BY',
  UNKNOWN = 'UNKNOWN',
}

export interface ILocation {
  longitude: number | string;
  latitude: number | string;
}

export interface IRestaurantLocationResponse {
  status: {
    message: string;
    code: number;
    type: string;
  };
  response: {
    restaurants: {
      restaurantStatus: string;
      facilities: string[];
      address: {
        addressLine1: string;
        cityTown: string;
        country: string;
        postalZip: string;
      };
      mcDeliveries: {
        mcDelivery: any[];
      };
      location: {
        latitude: number;
        longitude: number;
      };
      name: string;
      nationalStoreNumber: number;
      phoneNumber: string;
      status: number;
      timeZone: string;
      weekOpeningHours: {
        services: {
          endTime: string;
          isOpen: boolean;
          serviceName: string;
          startTime: string;
        }[];
        dayOfWeekId: number;
      }[];
    }[];
  };
}

export interface IRestaurantInfoResponse {
  status: {
    message: string;
    code: number;
    type: string;
  };
  response: {
    restaurant: {
      address: {
        addressLine1: string;
        cityTown: string;
        country: string;
        postalZip: string;
        stateProvince: string;
      };
      catalog: {
        pointsOfDistribution: {
          digitalServices: {
            key: string;
            technologies: {
              key: string;
            }[];
          }[];
          locationID: number;
          pod: number;
        }[];
        tableService: {
          enablePOSTableService: boolean;
          enableTableServiceEatin: string;
          enableTableServiceTakeout: string;
          minimumPurchaseAmount: number;
          tableServiceEnableMap: boolean;
          tableServiceLocatorEnabled: boolean;
          tableServiceLocatorMaxNumberValue: number;
          tableServiceLocatorMinNumberValue: number;
          digitalTableServiceMode: string;
          tableServiceTableNumberMinNumberValue: number;
          tableServiceTableNumberMaxNumberValue: number;
        };
        outageProductCodes: string[];
      };
      facilities: string[];
      nationalStoreNumber: number;
      name: string;
      status: number;
      restaurantStatus: string;
      location: {
        latitude: number;
        longitude: number;
      };
      order: {
        autoBagSaleInformation: {
          bagChoiceProductCode: number;
          bagDummyProductCode: number;
          bagProductCode: number;
          enabled: boolean;
          noBagProductCode: number;
        };
        expectedDeliveryTime: Date;
        storeMenuTypeCalendar: {
          endTime: string;
          menuTypeID: number;
          startTime: string;
          weekDay: number;
        }[];
        minimumOrderValue: number;
        largeOrderAllowed: boolean;
        linkedPaymentInformation: boolean;
        loyaltyEnabled: boolean;
        maximumTimeMinutes: number;
        minimumTimeMinutes: number;
        daypartTransitionOffset: number;
        readyOnArrivalInformation: boolean;
        orderAheadLane: boolean;
      };
      deposits: {
        code: string;
        description: string;
        pricing: {
          code: string;
          value: number;
        }[];
      }[];
      phoneNumber: string;
      timeZone: string;
      url: string;
      weekOpeningHours: {
        dayOfWeekId: number;
        services: {
          endTime: string;
          isOpen: boolean;
          serviceName: string;
          startTime: string;
          podType: number;
          saleTypes: any[];
        }[];
        startTime: string;
        weekDay: string;
        endTime: string;
        isOpen: boolean;
      }[];
      acceptOffer: boolean;
      areas: any[];
      contacts: {
        title: string;
        name: string;
      }[];
      countryCode: string;
      distance: number;
      gblNumber: string;
      id: string;
      isValid: boolean;
      marketCode: string;
      nowInStoreLocalTimeDate: Date;
      nutrition: {
        customerSelfPour: boolean;
        recalculateEnergyOnGrill: boolean;
      };
      offerConfiguration: {
        enableMultipleOffers: boolean;
        offerBuckets: {
          offerBucket: string;
          limit: number;
        }[];
      };
      specialDayservice: any[];
      statusID: number;
      tinThresholdAmout: number;
      storeType: {};
      todCutoffTime: Date;
      dayPart: number;
      npVersion: string;
      storeCutoffTime: Date;
      legalName: string;
      servicePayments: {
        serviceID: number;
        saleTypeEatIn: boolean;
        saleTypeOther: boolean;
        saleTypeTakeOut: boolean;
        paymentMethods: number[];
      }[];
      generalStatus: {
        status: number;
      };
      availableMenuProducts: {
        2: number[];
        3: number[];
      };
    };
  };
}

export enum IceType {
  MILCHSHAKE = 'MILCHSHAKE',
  MCSUNDAE = 'MCSUNDAE',
  MCFLURRY = 'MCFLURRY',
}

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  UNKNOWN = 'UNKNOWN',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export interface IRestaurantsEL {
  restaurants: {
    rid: string;
    name: string;
    longitude: number;
    latitude: number;
    addressLine1: string;
    zipCode: string;
    city: string;
    phone: string;
    email: string;
    facilities: string[];
    openingHours: {
      categoryName: string;
      hours: {
        weekday: string;
        start: string;
        end: string;
        status: string;
      }[];
    }[];
    lab: boolean;
    acceptsOffers: boolean;
    mopEnabled: boolean;
  }[];
  facilities: string[];
}
