import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { Pos } from '../../entities';
import { APIType, Availability } from '../../types';
import {
  BASIC_TOKEN_EL,
  CountryInfos,
  createDatabaseConnection,
  getClientId,
  getNewBearerToken,
} from '../../utils';
import { checkForMaschine } from './utils';

const logger = new Logger('getIceMaschineStatus');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Get new Bearer token');
  const bearerTokenEU = await getNewBearerToken(APIType.EU);
  logger.debug('new Token EU: ', bearerTokenEU);

  const bearerTokenEL = await getNewBearerToken(APIType.EL);
  logger.debug('new Token EL: ', bearerTokenEL);

  const clientIdEl = getClientId(BASIC_TOKEN_EL);

  logger.debug('Ensure Database Connection');
  await createDatabaseConnection();

  const posToCheck = await Pos.find({
    where: { hasMobileOrdering: true },
    order: { updatedAt: 'ASC' },
    take: 750,
  });

  const now = new Date();

  // eslint-disable-next-line no-restricted-syntax
  for await (const pos of posToCheck) {
    logger.debugObject('Checking Pos: ', pos);
    const posId = pos.nationalStoreNumber;

    const countryInfo = CountryInfos[pos.country];

    const storeApi = countryInfo.getStores.api;
    let bearerToken = '';
    if (storeApi === APIType.EU) {
      bearerToken = bearerTokenEU;
    } else if (storeApi === APIType.EL) {
      bearerToken = bearerTokenEL;
    }

    const { hasMilchshake, hasMcFlurry, hasMcSundae, status } =
      await checkForMaschine[storeApi](
        bearerToken,
        `${posId}`,
        pos.country,
        clientIdEl,
      );

    if (hasMilchshake === Availability.NOT_AVAILABLE) {
      if (pos.hasMilchshake === Availability.NOT_AVAILABLE) {
        pos.timeSinceBrokenMilchshake = now;
      }
    } else {
      pos.timeSinceBrokenMilchshake = null;
    }
    pos.hasMilchshake = hasMilchshake;

    if (hasMcFlurry === Availability.NOT_AVAILABLE) {
      if (pos.hasMcFlurry === Availability.NOT_AVAILABLE) {
        pos.timeSinceBrokenMcFlurry = now;
      }
    } else {
      pos.timeSinceBrokenMcFlurry = null;
    }
    pos.hasMcFlurry = hasMcFlurry;

    if (hasMcSundae === Availability.NOT_AVAILABLE) {
      if (pos.hasMcSundae === Availability.NOT_AVAILABLE) {
        pos.timeSinceBrokenMcSundae = now;
      }
    } else {
      pos.timeSinceBrokenMcSundae = null;
    }
    pos.hasMcSundae = hasMcSundae;

    pos.restaurantStatus = status;
    pos.lastCheck = now;

    await pos.save();
  }
};
