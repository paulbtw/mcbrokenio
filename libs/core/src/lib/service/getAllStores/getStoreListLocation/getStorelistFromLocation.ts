import axios, { AxiosError } from 'axios';
import { CreatePos, ICountryInfos, ILocation } from '../../../types';
import { IRestaurantLocationResponse } from '../../../types/responses';
import { Logger } from '@sailplane/logger';
import { randomUserAgent } from '../../../utils/randomUserAgent';

const logger = new Logger('getStoreListForLocation');

export async function getStorelistFromLocation(
  { latitude, longitude }: ILocation,
  { country, getStores: { url, mobileString } }: ICountryInfos,
  token: string,
  clientId: string,
) {
  try {
    if (!(latitude || longitude)) {
      return;
    }

    const {
      data: { response },
    } = await axios.get<IRestaurantLocationResponse>(
      `${url}latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          'User-Agent': randomUserAgent(),
          authorization: `Bearer ${token}`,
          'mcd-clientid': clientId,
          'mcd-marketid': country,
          'mcd-uuid': '"', // needs to be a truthy value
          'accept-language': country === 'UK' ? 'en-GB' : 'de-DE',
        },
      },
    );

    const posArray: CreatePos[] = response.restaurants.map((restaurant) => {
      const pos: CreatePos = {
        id: `${country}-${restaurant.nationalStoreNumber}`,
        nationalStoreNumber: `${restaurant.nationalStoreNumber}`,
        name: restaurant.name,
        hasMobileOrdering: mobileString
          ? restaurant.facilities.includes(mobileString)
          : false,
        latitude: restaurant.location.latitude.toString(),
        longitude: restaurant.location.longitude.toString(),
        country: country,
      };

      return pos;
    });

    return posArray;
  } catch (error) {
    // check if error is AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        logger.warn(`Bad request error`);
      } else {
        logger.error(
          `Error while getting stores for location ${latitude}, ${longitude} in ${country}: ${axiosError.response?.statusText}`,
        );
      }
    }

    logger.error('Error while getting stores for location, no axios error');
  }

  return [] as CreatePos[];
}
