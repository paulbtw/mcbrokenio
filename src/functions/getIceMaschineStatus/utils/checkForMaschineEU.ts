import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '.';
import {
  Availability,
  IceType,
  IRestaurantInfoResponse,
  Locations,
} from '../../../types';

const logger = new Logger('checkForMaschineEU');

export const checkForMaschineEU = async (
  bearerToken: string,
  nationalStoreNumber: string,
  location: Locations,
  clientId: string | undefined,
) => {
  if (!clientId) {
    throw Error('clientId is missing');
  }
  try {
    const response = await axios.get(
      `https://eu-prod.api.mcd.com/exp/v1/restaurant/${nationalStoreNumber}?filter=full&storeUniqueIdType=NatlStrNumber`,
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          'mcd-clientId': clientId,
          'mcd-sourceapp': 'GMA',
          'mcd-marketid': location,
          'mcd-uuid': '"',
          'accept-language': 'en-GB',
        },
      },
    );

    const data = response.data as IRestaurantInfoResponse;

    let hasMilchshake: Availability = Availability.UNKNOWN;
    let hasMcFlurry: Availability = Availability.UNKNOWN;
    let hasMcSundae: Availability = Availability.UNKNOWN;

    if (data.response?.restaurant?.catalog?.outageProductCodes) {
      const { outageProductCodes } = data.response.restaurant.catalog;
      hasMilchshake = hasProduct[IceType.MILCHSHAKE](
        outageProductCodes,
        location,
      );
      hasMcFlurry = hasProduct[IceType.MCFLURRY](outageProductCodes, location);
      hasMcSundae = hasProduct[IceType.MCSUNDAE](outageProductCodes, location);
    }
    return {
      hasMilchshake,
      hasMcFlurry,
      hasMcSundae,
      status: data.response.restaurant.restaurantStatus ?? 'UNKNOWN',
    };
  } catch (error) {
    logger.error(error);
    return {
      hasMilchshake: Availability.UNKNOWN,
      hasMcSundae: Availability.UNKNOWN,
      hasMcFlurry: Availability.UNKNOWN,
      status: 'UNKNOWN',
    };
  }
};
