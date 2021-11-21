import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { getAllLocation } from '.';
import { Pos } from '../../../entities';
import { APIType, IRestaurantLocationResponse } from '../../../types';
import {
  BASIC_TOKEN_EU,
  CountryInfos,
  getClientId,
  getNewBearerToken,
} from '../../../utils';

const logger = new Logger('getStoreListEU');

export const getStoreListEU = async () => {
  const bearerToken = await getNewBearerToken(APIType.EU);
  logger.debug('new Bearer Token: ', bearerToken);

  const clientId = getClientId(BASIC_TOKEN_EU);
  logger.debug(`clientId: ${clientId}`);

  const countriesEu = Object.values(CountryInfos).filter(
    (country) => country.getStores.api === APIType.EU,
  );

  // eslint-disable-next-line no-restricted-syntax
  for await (const country of countriesEu) {
    const countryFormatted = country.country;

    const locations = getAllLocation[countryFormatted];

    // eslint-disable-next-line no-restricted-syntax
    for await (const location of locations) {
      logger.debugObject('location: ', location);

      if (!location) {
        return;
      }

      const response = await axios.get(
        `${country.getStores.url}latitude=${location.latitude}&longitude=${location.longitude}`,
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
            'mcd-clientId': clientId,
            'mcd-marketid': countryFormatted,
            'mcd-uuid': '"', // needs to be a truthy value
            'accept-language': 'de-DE',
          },
        },
      );

      const data = response.data as IRestaurantLocationResponse;

      const posArray: Pos[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for await (const restaurant of data.response.restaurants) {
        logger.debugObject('restaurant: ', restaurant.nationalStoreNumber);

        const newPos = Pos.create({
          nationalStoreNumber: restaurant.nationalStoreNumber,
          name: restaurant.address.addressLine1,
          restaurantStatus: restaurant.restaurantStatus,
          latitude: `${restaurant.location.latitude}`,
          longitude: `${restaurant.location.longitude}`,
          country: countryFormatted,
          hasMobileOrdering: country.getStores.mobileString
            ? restaurant.facilities.includes(country.getStores.mobileString)
            : false,
        });

        posArray.push(newPos);
      }

      await Pos.save(posArray);
    }
  }
};
