import axios from 'axios';
import { Logger } from '@sailplane/logger';
import { getConnection } from 'typeorm';
import { CountryInfos, delay, KEY } from '../../../utils';
import { Pos } from '../../../entities';
import { APIType, IRestaurantsEL } from '../../../types';
import { upsertPos } from '.';

const logger = new Logger('getStoreListEL');

export const getStoreListEL = async () => {
  if (!KEY) {
    logger.debug('No key found');
    throw Error('You need to provide a key');
  }

  const countriesEl = Object.values(CountryInfos).filter(
    (country) => country.getStores.api === APIType.EL,
  );

  const posArray: Pos[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const store of countriesEl) {
    try {
      const response = await axios.get(
        `${store.getStores.url}?acceptOffers=all&lab=false&key=${KEY}`,
      );
      const data = response.data as IRestaurantsEL;

      // eslint-disable-next-line no-restricted-syntax
      for await (const restaurant of data.restaurants) {
        const newPos = Pos.create({
          nationalStoreNumber: `${store.country}-${restaurant.rid}`,
          name: restaurant.addressLine1,
          restaurantStatus: 'UNKNOWN',
          latitude: `${restaurant.latitude}`,
          longitude: `${restaurant.longitude}`,
          country: store.country,
          hasMobileOrdering: store.getStores.mobileString
            ? restaurant.facilities.includes(store.getStores.mobileString)
            : false,
          updatedAt: new Date(),
        });

        posArray.push(newPos);
      }
    } catch (error) {
      logger.error(error);
    }
    await delay(500);
  }

  const connection = getConnection();

  await upsertPos(posArray, connection);
};
