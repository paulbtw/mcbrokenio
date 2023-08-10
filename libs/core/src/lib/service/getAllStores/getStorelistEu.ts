import { Logger } from '@sailplane/logger';
import { APIType, Locations } from '../../types';
import { getMetaForApi } from '../../utils/getMetaForApi';
import { getAllLocation } from '../../constants';
import axios from 'axios';
import { IRestaurantLocationResponse } from '../../types/responses';
import { Pos } from '@prisma/client';
import PQueue from 'p-queue';

const logger = new Logger('StoreListEu');

const queue = new PQueue({ concurrency: 5 });

export async function getStorelistEu() {
  const { token, clientId, countryInfo } = await getMetaForApi(APIType.EU);

  countryInfo.map((country) => {
    const countryFormatted = country.country;

    const locations = getAllLocation[countryFormatted];

    if (!locations || !locations.length) {
      throw new Error(`No locations found for ${countryFormatted}`);
    }

    const posArray: Partial<Pos>[] = [];
    let promises: Promise<void>[];

    promises = locations.map(async ({ latitude, longitude }) => {
      try {
        const { data } = await axios.get<IRestaurantLocationResponse>(
          `${country.getStores.url}latitude=${latitude}&longitude=${longitude}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
              'mcd-clientid': clientId,
              'mcd-marketid': countryFormatted,
              'mcd-uuid': '"', // needs to be a truthy value
              'accept-language':
                countryFormatted === Locations.UK ? 'en-GB' : 'de-DE',
            },
          },
        );

        data.response.restaurants.forEach(
          ({ nationalStoreNumber, address, location, facilities }) => {
            posArray.push({
              hasMobileOrdering: country.getStores.mobileString
                ? facilities.includes(country.getStores.mobileString)
                : false,
              id: `${countryFormatted}-${nationalStoreNumber}`,
              name: address.addressLine1,
              latitude: location.latitude.toString(),
              longitude: location.longitude.toString(),
            });
          },
        );
      } catch (error) {
        logger.error(error);
      }
    });
  });

  return null;
}
