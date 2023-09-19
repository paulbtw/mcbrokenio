import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '.';
import {
  Availability,
  IceType,
  IRestaurantInfoResponseEL,
  Locations,
} from '../../../types';

const logger = new Logger('checkForMaschineEL');

export const checkForMaschineEL = async (
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
      `https://el-prod.api.mcd.com/exp/v1/restaurant/details/${nationalStoreNumber}`,
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          'mcd-clientid': clientId,
          'mcd-sourceapp': 'GMAL',
        },
      },
    );

    const data = response.data as IRestaurantInfoResponseEL;

    let hasMilchshake: Availability = Availability.UNKNOWN;
    let hasMcFlurry: Availability = Availability.UNKNOWN;
    let hasMcSundae: Availability = Availability.UNKNOWN;

    if (data.response?.restaurant?.OutageProductCodes) {
      const { OutageProductCodes } = data.response.restaurant;
      hasMilchshake = hasProduct[IceType.MILCHSHAKE](
        OutageProductCodes,
        location,
      );
      hasMcFlurry = hasProduct[IceType.MCFLURRY](OutageProductCodes, location);
      hasMcSundae = hasProduct[IceType.MCSUNDAE](OutageProductCodes, location);
    }
    return {
      hasMilchshake,
      hasMcFlurry,
      hasMcSundae,
      status: data.response.restaurant.StoreStatus ? 'OPEN' : 'CLOSED',
    };
  } catch (error) {
    logger.debug(error);
    return {
      hasMilchshake: Availability.UNKNOWN,
      hasMcFlurry: Availability.UNKNOWN,
      hasMcSundae: Availability.UNKNOWN,
      status: 'NOT CONNECTED',
    };
  }
};
