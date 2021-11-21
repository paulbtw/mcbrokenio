import axios from 'axios';
import { Logger } from '@sailplane/logger';
import { KEY } from '../../../utils';
import { Pos } from '../../../entities';
import { IRestaurantsEL } from '../../../types';
import { storeArray } from './storeArray';

const logger = new Logger('getStoreListEL');

export const getStoreListEL = async () => {
  if (!KEY) {
    logger.debug('No key found');
    throw Error('You need to provide a key');
  }
  // eslint-disable-next-line no-restricted-syntax
  for await (const store of storeArray) {
    const response = await axios.get(
      `${store.url}?acceptOffers=all&lab=false&key=${KEY}`,
    );
    const data = response.data as IRestaurantsEL;

    const posArray: Pos[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const restaurant of data.restaurants) {
      const newPos = Pos.create({
        nationalStoreNumber: parseInt(restaurant.rid, 10),
        name: restaurant.addressLine1,
        restaurantStatus: 'UNKNOWN',
        latitude: `${restaurant.latitude}`,
        longitude: `${restaurant.longitude}`,
        country: store.country,
        hasMobileOrdering: restaurant.facilities.includes(store.mobileString),
      });

      logger.debugObject('New Pos: ', newPos);
      posArray.push(newPos);
    }

    await Pos.save(posArray);
  }
};
