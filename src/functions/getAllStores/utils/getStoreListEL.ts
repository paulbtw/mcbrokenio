import axios from 'axios';
import { Logger } from '@sailplane/logger';
import { CountryInfos, KEY } from '../../../utils';
import { Pos } from '../../../entities';
import { APIType, IRestaurantsEL } from '../../../types';

const logger = new Logger('getStoreListEL');

export const getStoreListEL = async () => {
  if (!KEY) {
    logger.debug('No key found');
    throw Error('You need to provide a key');
  }

  const countriesEl = Object.values(CountryInfos).filter(
    (country) => country.getStores.api === APIType.EL,
  );
  // eslint-disable-next-line no-restricted-syntax
  for await (const store of countriesEl) {
    const response = await axios.get(
      `${store.getStores.url}?acceptOffers=all&lab=false&key=${KEY}`,
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
        hasMobileOrdering: store.getStores.mobileString
          ? restaurant.facilities.includes(store.getStores.mobileString)
          : false,
      });

      logger.debugObject('New Pos: ', newPos);
      posArray.push(newPos);
    }

    await Pos.save(posArray);
  }
};
