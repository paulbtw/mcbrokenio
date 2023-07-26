import { Handler } from 'aws-lambda';
import { Pos } from '../../entities';
import { APIType, Availability } from '../../types';
import {
  BASIC_TOKEN_AP,
  BASIC_TOKEN_EL,
  BASIC_TOKEN_EU,
  BASIC_TOKEN_US,
  chunk,
  CountryInfos,
  createDatabaseConnection,
  getClientId,
  getNewBearerToken,
} from '../../utils';
import { checkForMaschine } from './utils';

export const main: Handler = async () => {
  try {
    const [bearerTokenEU, bearerTokenEL, bearerTokenUS, bearerTokenAP] =
      await Promise.all([
        getNewBearerToken(APIType.EU),
        getNewBearerToken(APIType.EL),
        getNewBearerToken(APIType.US),
        getNewBearerToken(APIType.AP),
      ]);

    const [clientIdEL, clientIdUS, clientIdEU, clientIdAP] = await Promise.all([
      getClientId(BASIC_TOKEN_EL),
      getClientId(BASIC_TOKEN_US),
      getClientId(BASIC_TOKEN_EU),
      getClientId(BASIC_TOKEN_AP),
    ]);

    const connection = await createDatabaseConnection();

    const posToCheck = await Pos.find({
      where: { hasMobileOrdering: true },
      order: { updatedAt: 'ASC' },
      take: 2000,
    });

    const now = new Date();

    const newPosArray: Pos[] = [];

    const batchedPos = chunk<Pos>(posToCheck, 10);

    // eslint-disable-next-line no-restricted-syntax
    for await (const posArray of batchedPos) {
      await Promise.all(
        posArray.map(async (pos) => {
          const newPos = Pos.create({
            nationalStoreNumber: pos.nationalStoreNumber,
            name: pos.name,
            restaurantStatus: pos.restaurantStatus,
            latitude: pos.latitude,
            longitude: pos.longitude,
            hasMilchshake: pos.hasMilchshake,
            hasMcFlurry: pos.hasMcFlurry,
            hasMcSundae: pos.hasMcSundae,
            lastCheck: now,
            timeSinceBrokenMilchshake: pos.timeSinceBrokenMilchshake,
            timeSinceBrokenMcFlurry: pos.timeSinceBrokenMcFlurry,
            timeSinceBrokenMcSundae: pos.timeSinceBrokenMcSundae,
            country: pos.country,
            hasMobileOrdering: pos.hasMobileOrdering,
          });
          // const newPos = pos;
          const posId = newPos.nationalStoreNumber.split('-')[1];

          const countryInfo = CountryInfos[newPos.country];

          const storeApi = countryInfo.getStores.api;
          let bearerToken = '';
          let clientId = '';
          if (storeApi === APIType.EU) {
            bearerToken = bearerTokenEU;
            clientId = clientIdEU;
          } else if (storeApi === APIType.EL) {
            bearerToken = bearerTokenEL;
            clientId = clientIdEL;
          } else if (storeApi === APIType.US) {
            bearerToken = bearerTokenUS;
            clientId = clientIdUS;
          } else if (storeApi === APIType.AP) {
            bearerToken = bearerTokenAP;
            clientId = clientIdAP;
          }

          clientId = clientId.trim();

          const { hasMilchshake, hasMcFlurry, hasMcSundae, status } =
            await checkForMaschine[storeApi](
              bearerToken,
              posId,
              newPos.country,
              clientId,
            );

          if (status === 'NOT CONNECTED') {
            return;
          }

          if (hasMilchshake === Availability.NOT_AVAILABLE) {
            if (newPos.hasMilchshake !== Availability.NOT_AVAILABLE) {
              newPos.timeSinceBrokenMilchshake =
                newPos.timeSinceBrokenMilchshake
                  ? newPos.timeSinceBrokenMilchshake
                  : now;
            }
          } else {
            newPos.timeSinceBrokenMilchshake = null;
          }
          newPos.hasMilchshake = hasMilchshake;

          if (hasMcFlurry === Availability.NOT_AVAILABLE) {
            if (newPos.hasMcFlurry !== Availability.NOT_AVAILABLE) {
              newPos.timeSinceBrokenMcFlurry = newPos.timeSinceBrokenMcFlurry
                ? newPos.timeSinceBrokenMcFlurry
                : now;
            }
          } else {
            newPos.timeSinceBrokenMcFlurry = null;
          }
          newPos.hasMcFlurry = hasMcFlurry;

          if (hasMcSundae === Availability.NOT_AVAILABLE) {
            if (newPos.hasMcSundae !== Availability.NOT_AVAILABLE) {
              newPos.timeSinceBrokenMcSundae = newPos.timeSinceBrokenMcSundae
                ? newPos.timeSinceBrokenMcSundae
                : now;
            }
          } else {
            newPos.timeSinceBrokenMcSundae = null;
          }
          newPos.hasMcSundae = hasMcSundae;

          newPos.restaurantStatus = status;
          newPos.lastCheck = now;

          newPosArray.push(newPos);
        }),
      );
    }

    await Pos.save(newPosArray, { chunk: 1000 });

    if (connection.isInitialized) {
      await connection.destroy();
    }
  } catch (error) {
    return null;
  }
  return null;
};
