export enum Locations {
  AE = 'AE', // United Arab Emirates
  AT = 'AT', // Austria
  AU = 'AU', // Australia
  BA = 'BA', // Bosnia and Herzegovina
  BE = 'BE', // Belgium
  BG = 'BG', // Bulgaria
  BY = 'BY', // Belarus
  CA = 'CA', // Canada
  CH = 'CH', // Switzerland
  DE = 'DE', // Germany
  DK = 'DK', // Denmark
  EE = 'EE', // Estonia
  ES = 'ES', // Spain
  FI = 'FI', // Finland
  FR = 'FR', // United Kingdom
  GE = 'GE', // Georgia
  GR = 'GR', // Greece
  GT = 'GT', // Guatemala
  HK = 'HK', // Hong Kong
  HN = 'HN', // Honduras
  HR = 'HR', // Croatia
  ID = 'ID', // Indonesia
  IE = 'IE', // Ireland
  IT = 'IT', // Italy
  LT = 'LT', // Lithuania
  MA = 'MA', // Morocco
  MT = 'MT', // Malta
  MU = 'MU', // Mauritius
  MY = 'MY', // Malaysia
  NI = 'NI', // Nicaragua
  NL = 'NL', // Netherlands
  NO = 'NO', // Norway
  PK = 'PK', // Pakistan
  PL = 'PL', // Poland
  PT = 'PT', // Portugal
  PY = 'PY', // Paraguay
  RE = 'RE', // Reunion
  RO = 'RO', // Romania
  RS = 'RS', // Serbia
  SAR = 'SAR', // Saudi Arabia
  SE = 'SE', // Sweden
  SI = 'SI', // Slovenia
  SV = 'SV', // El Salvador
  TH = 'TH', // Thailand
  UA = 'UA', // Ukraine
  UK = 'UK', // United Kingdom
  UNKNOWN = 'UNKNOWN',
  US = 'US', // United States
  VN = 'VN', // Vietnam
}

export interface ILocation {
  latitude: number | string;
  longitude: number | string;
}

export interface IRestaurantLocationResponse {
  response: {
    restaurants: {
      address: {
        addressLine1: string;
        cityTown: string;
        country: string;
        postalZip: string;
      };
      facilities: string[];
      location: {
        latitude: number;
        longitude: number;
      };
      mcDeliveries: {
        mcDelivery: any[];
      };
      name: string;
      nationalStoreNumber: number;
      phoneNumber: string;
      restaurantStatus: string;
      status: number;
      timeZone: string;
      weekOpeningHours: {
        dayOfWeekId: number;
        services: {
          endTime: string;
          isOpen: boolean;
          serviceName: string;
          startTime: string;
        }[];
      }[];
    }[];
  };
  status: {
    code: number;
    message: string;
    type: string;
  };
}

export interface IRestaurantInfoResponse {
  response: {
    restaurant: {
      acceptOffer: boolean;
      address: {
        addressLine1: string;
        cityTown: string;
        country: string;
        postalZip: string;
        stateProvince: string;
      };
      areas: any[];
      availableMenuProducts: {
        2: number[];
        3: number[];
      };
      catalog: {
        outageProductCodes: string[];
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
          digitalTableServiceMode: string;
          enablePOSTableService: boolean;
          enableTableServiceEatin: string;
          enableTableServiceTakeout: string;
          minimumPurchaseAmount: number;
          tableServiceEnableMap: boolean;
          tableServiceLocatorEnabled: boolean;
          tableServiceLocatorMaxNumberValue: number;
          tableServiceLocatorMinNumberValue: number;
          tableServiceTableNumberMaxNumberValue: number;
          tableServiceTableNumberMinNumberValue: number;
        };
      };
      contacts: {
        name: string;
        title: string;
      }[];
      countryCode: string;
      dayPart: number;
      deposits: {
        code: string;
        description: string;
        pricing: {
          code: string;
          value: number;
        }[];
      }[];
      distance: number;
      facilities: string[];
      gblNumber: string;
      generalStatus: {
        status: number;
      };
      id: string;
      isValid: boolean;
      legalName: string;
      location: {
        latitude: number;
        longitude: number;
      };
      marketCode: string;
      name: string;
      nationalStoreNumber: number;
      nowInStoreLocalTimeDate: Date;
      npVersion: string;
      nutrition: {
        customerSelfPour: boolean;
        recalculateEnergyOnGrill: boolean;
      };
      offerConfiguration: {
        enableMultipleOffers: boolean;
        offerBuckets: {
          limit: number;
          offerBucket: string;
        }[];
      };
      order: {
        autoBagSaleInformation: {
          bagChoiceProductCode: number;
          bagDummyProductCode: number;
          bagProductCode: number;
          enabled: boolean;
          noBagProductCode: number;
        };
        daypartTransitionOffset: number;
        expectedDeliveryTime: Date;
        largeOrderAllowed: boolean;
        linkedPaymentInformation: boolean;
        loyaltyEnabled: boolean;
        maximumTimeMinutes: number;
        minimumOrderValue: number;
        minimumTimeMinutes: number;
        orderAheadLane: boolean;
        readyOnArrivalInformation: boolean;
        storeMenuTypeCalendar: {
          endTime: string;
          menuTypeID: number;
          startTime: string;
          weekDay: number;
        }[];
      };
      phoneNumber: string;
      restaurantStatus: string;
      servicePayments: {
        paymentMethods: number[];
        saleTypeEatIn: boolean;
        saleTypeOther: boolean;
        saleTypeTakeOut: boolean;
        serviceID: number;
      }[];
      specialDayservice: any[];
      status: number;
      statusID: number;
      storeCutoffTime: Date;
      storeType: {};
      timeZone: string;
      tinThresholdAmout: number;
      todCutoffTime: Date;
      url: string;
      weekOpeningHours: {
        dayOfWeekId: number;
        endTime: string;
        isOpen: boolean;
        services: {
          endTime: string;
          isOpen: boolean;
          podType: number;
          saleTypes: any[];
          serviceName: string;
          startTime: string;
        }[];
        startTime: string;
        weekDay: string;
      }[];
    };
  };
  status: {
    code: number;
    message: string;
    type: string;
  };
}

export enum IceType {
  MCFLURRY = 'MCFLURRY',
  MCSUNDAE = 'MCSUNDAE',
  MILCHSHAKE = 'MILCHSHAKE',
}

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  UNKNOWN = 'UNKNOWN',
}

export interface IRestaurantsEL {
  facilities: string[];
  restaurants: {
    acceptsOffers: boolean;
    addressLine1: string;
    city: string;
    email: string;
    facilities: string[];
    lab: boolean;
    latitude: number;
    longitude: number;
    mopEnabled: boolean;
    name: string;
    openingHours: {
      categoryName: string;
      hours: {
        end: string;
        start: string;
        status: string;
        weekday: string;
      }[];
    }[];
    phone: string;
    rid: string;
    zipCode: string;
  }[];
}

export enum APIType {
  AP = 'AP',
  EL = 'EL',
  EU = 'EU',
  HK = 'HK',
  UNKNOWN = 'UNKNOWN',
  US = 'US',
}

export interface ICountryInfos {
  country: Locations;
  getStores: {
    api: APIType;
    mobileString: string | null;
    url: string;
  };
  productCodes: {
    [IceType.MILCHSHAKE]: string[];
    [IceType.MCSUNDAE]: string[];
    [IceType.MCFLURRY]: string[];
  };
}

export interface IRestaurantInfoResponseEL {
  response: {
    ResultCode: number;
    restaurant: {
      AcceptsOffer: boolean;
      AdvancedOrderMaximumTimeLimitMinutes: number;
      AdvancedOrderMinimumTimeLimitMinutes: number;
      AutoBagSaleInformation: {
        BagChoiceProductCode: number;
        BagDummyProductCode: number;
        BagProductCode: number;
        Enabled: boolean;
        NoBagProductCode: number;
      };
      AvailableMenuProducts: {
        1: number[];
        2: number[];
      };
      CytIngredientGroups?: any;
      DayPart: number;
      DayPartTransitionOffset: number;
      DeliverEarlyMode?: any;
      DeliverLaterProductCode?: any;
      DepositTypes?: any;
      Distance: number;
      ExpectedDeliveryTime: Date;
      IsValid: boolean;
      LargeOrderAllowed: boolean;
      LegalName: string;
      LinkedPaymentInformation: {
        isEnabled: boolean;
      };
      Locations: {
        FulfilmentFacilityCode: string;
        LocationID: number;
        PaymentMethods: any[];
        SaleTypeEatIn: boolean;
        SaleTypeOther: boolean;
        SaleTypeTakeOut: boolean;
        StoreAreaOpeningHours: {
          DayOfWeekID: number;
          FromTime: string;
          ToTime: string;
        }[];
      }[];
      LoyaltyInformation: {
        isEnabled: boolean;
      };
      MinimumOrderValue: number;
      NPVersion: string;
      NowInStoreLocalTimeDate: Date;
      NowInStoreLocalTimeDateTime: Date;
      NutritionalInformation: {
        CustomerSelfPour: boolean;
        EnergyUnit?: any;
        RecalculateEnergyOnGrill: boolean;
      };
      OfferConfiguration: {
        EnableMultipleOffers: boolean;
        MaxNumberOfLoyaltyRewards: number;
        MaxNumberOfPrizeOffers: number;
        MaxNumberOfPunchCardRewards: number;
        MaxNumberOfRegularOffers: number;
      };
      OpeningHours: {
        DayOfTheWeek: number;
        FromTime: string;
        ToTime: string;
      }[];
      OrderMaximumTimeMinutes: number;
      OrderMinimumTimeMinutes: number;
      OutageProductCodes: string[];
      PointsOfDistribution: {
        DigitalServices: {
          Key: string;
          Technologies: {
            Key: string;
          }[];
        }[];
        FulFillmentFacilityCode: string;
        LocationID: number;
        POD: number;
      }[];
      ReadyOnArrivalInformation: {
        enableGMAFoodReadyOnArrivalFlow: boolean;
        isOrderAheadLaneEnabled: boolean;
      };
      RestaurantID: number;
      StatusID: number;
      StoreCutoffTime: Date;
      StoreMenuTypeCalendar: {
        EndTime: string;
        MenuTypeID: number;
        StartTime: string;
        Weekday: number;
      }[];
      StoreNumber: string;
      StoreStatus: number;
      SuppressChoiceDiscount?: any;
      TINThresholdAmount: number;
      TODCutoffTime: Date;
      TableService: {
        DigitalTableServiceMode: string;
        EnablePOSTableService: boolean;
        EnableTableServiceEatin: string;
        EnableTableServiceTakeout: string;
        MinimumPurchaseAmount: number;
        TableServiceEnableMap: boolean;
        TableServiceLocatorEnabled: boolean;
        TableServiceLocatorMaxNumberValue: number;
        TableServiceLocatorMinNumberValue: number;
        TableServiceTableNumberMaxNumberValue: number;
        TableServiceTableNumberMinNumberValue: number;
        TableServiceTimeRange: {
          Enabled: boolean;
          EndTime: string;
          StartTime: string;
        };
        ZoneDefinitions?: any;
      };
      TimeZone: number;
    };
  };
  status: {
    code: number;
    message: string;
    type: string;
  };
}

export interface IRestaurantInfoResponseHK {
  Data: {
    AcceptsOffers: boolean;
    CatalogVersions: {
      Type: number;
      Version: Date;
    }[];
    CytIngredientGroups?: any;
    DayPart: number;
    DeliveryLaterProductCode?: any;
    Distance: number;
    EstimatedDeliveryTimeInStoreLocalTime: Date;
    ExpectedDeliveryTime: Date;
    ExternalStoreNumber: string;
    Facilities: any[];
    IsValid: boolean;
    LargeOrderAllowed: boolean;
    Latitude: string;
    Locations: {
      LocationID: number;
      PaymentMethods: number[];
      SaleTypeEatIn: boolean;
      SaleTypeOther: boolean;
      SaleTypeTakeOut: boolean;
      StoreAreaOpeningHours: {
        DayOfWeekID: number;
        FromTime: string;
        ToTime: string;
      }[];
    }[];
    Longitude: string;
    MenuTypeTransitionThreshold: number;
    MinimumOrderValue: number;
    NPVersion: string;
    NowInStoreLocalTime: Date;
    OpeningHours: {
      BreakfastFrom: string;
      BreakfastTo: string;
      DayOfTheWeek: number;
      FromTime: string;
      ToTime: string;
    }[];
    OrderMaxTimeMIN: number;
    OrderMinTimeMIN: number;
    OutageProductCodes: string[];
    PointsOfDistribution: any[];
    PromoWhenFree: boolean;
    RestrictionRuleEndTime: Date;
    RestrictionRuleEndTimeInStoreLocalTime: Date;
    StatusID: number;
    StoreAddress: string;
    StoreAddressCity: string;
    StoreAddressCountry: string;
    StoreAddressState: string;
    StoreAddressZIP: string;
    StoreCutoffTime: Date;
    StoreCutoffTimeInStoreLocalTime: Date;
    StoreMenuTypeCalendar: any[];
    StoreName: string;
    StoreNumber: string;
    StoreStatus: number;
    SuppressChoiceDiscount: boolean;
    TODCutoffTime: Date;
    TODCutoffTimeInStoreLocalTime: Date;
    TableService?: any;
    TimeZone: number;
  };
  ResultCode: number;
}

export interface IRestaurantLocationsResponseHK {
  address: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    area: string;
    branch: string;
    cityTown: string;
    country: string;
    county: string;
    crossStreets: string;
    district: string;
    location: {
      lat: number;
      lon: number;
    };
    postalZip: string;
    region: string;
    stateProvince: string;
    subdivision: string;
  };
  availableToPublic: boolean;
  countryCode: string;
  currentStatus: {
    description: string;
    status: string;
  };
  customerTouchpoint: {
    contact: {
      name: string;
      title: string;
    }[];
  };
  generalStatus: {
    description: string;
    status: string;
  };
  id: string;
  identifiers: {
    gblnumber: string;
    storeIdentifier: {
      identifierType: string;
      identifierValue: string;
    }[];
  };
  isMcOpco: boolean;
  localization: string;
  longDescription: string;
  marketCode: string;
  marketLanguages: {
    marketlanguage: {
      marketLanguageCode: string;
    }[];
  };
  mcDeliveries: {
    mcDelivery: any[];
  };
  mcDeliveryURL: string;
  noticeStartDate?: number;
  publicName: string;
  restaurantLanguages: {
    restaurantLanguage: {
      language: string;
    }[];
  };
  shortDescription: string;
  storeAreas: {
    storearea: any[];
  };
  storeAttributes: {
    attribute: {
      attributeClass: string;
      dayOfWeek: any[];
      endDate?: number;
      endTime?: number;
      startDate?: number;
      startTime?: number;
      type: string;
    }[];
  };
  storeEmail: string;
  storeMilestones: {
    storeProject: any[];
  };
  storeNotice: string;
  storeNumbers: {
    phonenumber: {
      number: string;
      type: string;
    }[];
  };
  storeServices: {
    dayofweekservice: {
      dayOfWeek: string;
      endTime: number;
      isOpen: boolean;
      service: string;
      startTime: number;
    }[];
    specialdayservice: any[];
  };
  storeType: {
    partyname: string;
  };
  timeZone: string;
  urls: {
    url: any[];
  };
}
