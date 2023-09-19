import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { hasProduct } from '.';
import {
  Availability,
  IceType,
  IRestaurantInfoResponseHK,
  Locations,
} from '../../../types';
import { API_KEY_AP } from '../../../utils';

const logger = new Logger('checkForMaschineHK');

export const checkForMaschineHK = async (
  _bearerToken: string,
  nationalStoreNumber: string,
  location: Locations,
) => {
  if (!API_KEY_AP) {
    logger.error('API Key is missing');
    throw Error('API key is missing');
  }

  try {
    const response = await axios.get(
      `https://ap.api.mcd.com/v3/restaurant/information?application=MOT&deviceBuildId=4.8.40&languageName=en-HK&marketId=852&platform=iphone&storeNumber=${nationalStoreNumber}`,
      {
        headers: {
          mcd_apikey: API_KEY_AP,
          marketid: `${location}`,
        },
      },
    );

    const data = response.data as IRestaurantInfoResponseHK;

    let hasMilchshake: Availability = Availability.UNKNOWN;
    let hasMcFlurry: Availability = Availability.UNKNOWN;
    let hasMcSundae: Availability = Availability.UNKNOWN;

    if (data.Data) {
      const { OutageProductCodes } = data.Data;
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
      status: data.Data.StoreStatus ? 'OPEN' : 'CLOSED',
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
