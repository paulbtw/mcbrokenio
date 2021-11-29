import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { Pos } from '../../../entities';
import { APIType, IRestaurantLocationsResponseHK } from '../../../types';
import { API_KEY_AP, CountryInfos } from '../../../utils';

const logger = new Logger('getStoreListHK');

export const getStoreListHK = async () => {
  if (!API_KEY_AP) {
    logger.debug('No api key found');
    throw Error('No api key found');
  }

  const countriesAp = Object.values(CountryInfos).filter(
    (country) => country.getStores.api === APIType.HK,
  );

  const posArray: Pos[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const country of countriesAp) {
    try {
      const response = await axios.get(
        `${country.getStores.url}`,
      );
  
      const data = response.data as IRestaurantLocationsResponseHK[];
  
      // eslint-disable-next-line no-restricted-syntax
      for await (const restaurant of data) {
        const nationalStoreNumber = restaurant.identifiers.storeIdentifier.filter((id) => id.identifierType === 'LocalRefNum');
        const hasMobileOrdering = restaurant.storeAttributes.attribute.filter(
          (attribute) => attribute.type === country.getStores.mobileString,
        );
  
        const newPos = Pos.create({
          nationalStoreNumber: parseInt(nationalStoreNumber[0].identifierValue, 10),
          name: restaurant.address.addressLine1,
          restaurantStatus: 'UNKNOWN',
          latitude: `${restaurant.address.location.lat}`,
          longitude: `${restaurant.address.location.lon}`,
          country: country.country,
          hasMobileOrdering: hasMobileOrdering.length > 0,
        });
  
        posArray.push(newPos);
      }
    } catch (error) {
      logger.error(error);
    }
    
  }

  await Pos.save(posArray);
};
