import { Logger } from '@sailplane/logger';
import { CreatePos, ICountryInfos } from '../../../types';
import axios from 'axios';
import { IRestaurantsUrlResponse } from '../../../types/responses';
import { KEY } from '../../../constants';

const logger = new Logger('getStorelistFromUrl');

export async function getStorelistFromUrl({
  country,
  getStores: { url, mobileString },
}: ICountryInfos) {
  try {
    const {
      data: { restaurants },
    } = await axios.get<IRestaurantsUrlResponse>(
      `${url}?acceptOffers=all&lab=false&key=${KEY}`,
    );

    const posArray: CreatePos[] = restaurants.map((restaurant) => {
      const pos: CreatePos = {
        nationalStoreNumber: `${country}-${restaurant.rid}`,
        name: restaurant.addressLine1,
        hasMobileOrdering: mobileString
          ? restaurant.facilities.includes(mobileString)
          : false,
        latitude: restaurant.latitude.toString(),
        longitude: restaurant.longitude.toString(),
        country: country,
      };

      return pos;
    });

    return posArray;
  } catch (error) {
    logger.error('Error while getting storelist from url');
  }
}
