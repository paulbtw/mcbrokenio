import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '.';
import { IceType, IRestaurantInfoResponse } from '../types';

const logger = new Logger('checkForMaschine');

export const checkForMaschine = async (
  bearerToken: string,
  nationalStoreNumber: number,
) => {
  try {
    const response = await axios.get(
      `https://eu-prod.api.mcd.com/exp/v1/restaurant/${nationalStoreNumber}?filter=full&storeUniqueIdType=ECPID`,
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    const data = response.data as IRestaurantInfoResponse;

    let hasMilchshake: boolean | null = null;
    let hasMcFlurry: boolean | null = null;
    let hasMcSundae: boolean | null = null;

    if (data.response?.restaurant?.catalog?.outageProductCodes) {
      const { outageProductCodes } = data.response.restaurant.catalog;
      hasMilchshake = hasProduct[IceType.MILCHSHAKE](outageProductCodes);
      hasMcFlurry = hasProduct[IceType.MCFLURRY](outageProductCodes);
      hasMcSundae = hasProduct[IceType.MCSUNDAE](outageProductCodes);
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
      hasMilchshake: null,
      hasMcSundae: null,
      hasMcFlurry: null,
      status: 'UNKNOWN',
    };
  }
};
