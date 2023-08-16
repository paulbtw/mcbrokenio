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
