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

export interface IRestaurantsUrlResponse {
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

export interface RestaurantInfoEuResponse {
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
      specialDayservice: unknown[];
      status: number;
      statusID: number;
      storeCutoffTime: Date;
      storeType: unknown;
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
          saleTypes: unknown[];
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
