import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { getAllLocation } from '.';
import { Pos } from '../../../entities';
import { IRestaurantLocationResponse, Locations } from '../../../types';
import { getClientId, getNewBearerToken } from '../../../utils';

const logger = new Logger('getStoreListEU');

export const getStoreListEU = async () => {
  const availableLocations = Object.keys(getAllLocation);

  const bearerToken = await getNewBearerToken();
  logger.debug('new Bearer Token: ', bearerToken);

  const clientId = getClientId();
  logger.debug(`clientId: ${clientId}`);

  // eslint-disable-next-line no-restricted-syntax
  for await (const country of availableLocations) {
    const countryFormatted = country as Locations;

    const locations = getAllLocation[countryFormatted];

    // eslint-disable-next-line no-restricted-syntax
    for await (const location of locations) {
      logger.debugObject('location: ', location);

      const response = await axios.get(
        `https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&latitude=${location.latitude}&longitude=${location.longitude}`,
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
          hasMobileOrdering: restaurant.facilities.includes('MOBILEORDERS'),
        });

        posArray.push(newPos);
      }

      await Pos.save(posArray);
    }
  }
};
