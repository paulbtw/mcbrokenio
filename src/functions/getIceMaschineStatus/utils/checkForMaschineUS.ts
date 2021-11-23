import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '.';
import {
  Availability,
  IceType,
  IRestaurantInfoResponse,
  Locations,
} from '../../../types';

const logger = new Logger('checkForMaschineUS');

export const checkForMaschineUS = async (
  bearerToken: string,
  nationalStoreNumber: string,
  location: Locations,
  clientId: string | undefined,
) => {
  if (!clientId) {
    throw Error('Client ID is missing');
  }
  try {
    const response = await axios.get(
      `https://us-prod.api.mcd.com/exp/v1/restaurant/${nationalStoreNumber}?filter=full&storeUniqueIdType=NatlStrNumber`,
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          'accept-language': 'en-US',
          'mcd-clientid': clientId,
          'mcd-marketid': 'US',
          'mcd-sourceapp': 'GMA',
          'mcd-uuid': '"',
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
