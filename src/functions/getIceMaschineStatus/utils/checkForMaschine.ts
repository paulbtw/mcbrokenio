import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '../../../utils';
import { Availability, IceType, IRestaurantInfoResponse } from '../../../types';

const logger = new Logger('checkForMaschine');

/**
 * Need to add a check based on the Country
 * They all have different Product ids unfortunatly
 */
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
      hasMilchshake: hasMilchshake
        ? Availability.AVAILABLE
        : Availability.NOT_AVAILABLE,
      hasMcFlurry: hasMcFlurry
        ? Availability.AVAILABLE
        : Availability.NOT_AVAILABLE,
      hasMcSundae: hasMcSundae
        ? Availability.AVAILABLE
        : Availability.NOT_AVAILABLE,
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
