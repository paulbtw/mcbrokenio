import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { getConnection } from 'typeorm';
import { getAllLocation, upsertPos } from '.';
import { Pos } from '../../../entities';
import { APIType, IRestaurantLocationResponse } from '../../../types';
import {
  BASIC_TOKEN_EU,
  chunk,
  CountryInfos,
  delay,
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

  const posArray: Pos[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const country of countriesEu) {
    const countryFormatted = country.country;

    const locations = getAllLocation[countryFormatted];

    if (!locations) {
      throw new Error(`No locations found for ${countryFormatted}`);
    }

    const batchedLocations = chunk(locations, 10);

    // eslint-disable-next-line no-restricted-syntax
    for await (const locationsArray of batchedLocations) {
      await Promise.all(
        locationsArray.map(async (location) => {
          try {
            if (!location) {
              return;
            }

            const response = await axios.get(
              `${country.getStores.url}latitude=${location.latitude}&longitude=${location.longitude}`,
              {
                headers: {
                  authorization: `Bearer ${bearerToken}`,
                  'mcd-clientid': clientId,
                  'mcd-marketid': countryFormatted,
                  'mcd-uuid': '"', // needs to be a truthy value
                  'accept-language':
                    countryFormatted === 'UK' ? 'en-GB' : 'de-DE',
                },
              },
            );

            const data = response.data as IRestaurantLocationResponse;

            // eslint-disable-next-line no-restricted-syntax
            for (const restaurant of data.response.restaurants) {
              const newPos = Pos.create({
                nationalStoreNumber: `${countryFormatted}-${restaurant.nationalStoreNumber}`,
                name: restaurant.address.addressLine1,
                restaurantStatus: restaurant.restaurantStatus,
                latitude: `${restaurant.location.latitude}`,
                longitude: `${restaurant.location.longitude}`,
                country: countryFormatted,
                hasMobileOrdering: country.getStores.mobileString
                  ? restaurant.facilities.includes(
                      country.getStores.mobileString,
                    )
                  : false,
                updatedAt: new Date(),
              });

              posArray.push(newPos);
            }
          } catch (error) {
            logger.error(error);
          }
        }),
      );
      await delay(1000);
    }
  }

  const connection = getConnection();

  await upsertPos(posArray, connection);
};
