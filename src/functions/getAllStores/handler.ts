import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import axios from 'axios';
import { Pos } from '../../entities';
import { IRestaurantLocationResponse, Locations } from '../../types';
import {
  createDatabaseConnection,
  DATABASE_URL,
  getClientId,
  getNewBearerToken,
} from '../../utils';
import { getAllLocation } from '../../utils/getAllLocation';

const logger = new Logger('getAllStores');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  if (DATABASE_URL == null) {
    throw new Error('DATABASE_URL is not set');
  }

  logger.debug('Get new Bearer token');
  const bearerToken = await getNewBearerToken();
  logger.debug('new Token: ', bearerToken);

  const clientId = getClientId();
  logger.debug(`clientId: ${clientId}`);

  logger.debug('Ensure Database Connection');
  const connection = await createDatabaseConnection();

  const availableLocations = Object.keys(getAllLocation);
  logger.debugObject('availableLocations: ', availableLocations);

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

      logger.debugObject('Response data: ', data);

      const posArray: Pos[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const restaurant of data.response.restaurants) {
        logger.debugObject('restaurant: ', restaurant);

        const newPos = Pos.create({
          nationalStoreNumber: restaurant.nationalStoreNumber,
          name: restaurant.name,
          restaurantStatus: restaurant.restaurantStatus,
          latitude: `${restaurant.location.latitude}`,
          longitude: `${restaurant.location.longitude}`,
          country: countryFormatted,
        });

        posArray.push(newPos);

        logger.debugObject('newPosValues: ', newPos);
      }

      await Pos.save(posArray);
    }
  }

  if (connection.isConnected) {
    logger.debug('Closing Database Connection');
    await connection.close();
  }
};
