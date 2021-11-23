import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { Pos } from '../../entities';
import { APIType, Availability } from '../../types';
import {
  BASIC_TOKEN_EL,
  BASIC_TOKEN_US,
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

  const bearerTokenUS = await getNewBearerToken(APIType.US);
  logger.debug('new Token US: ', bearerTokenUS);

  const clientIdEl = getClientId(BASIC_TOKEN_EL);
  const clientIdUs = getClientId(BASIC_TOKEN_US);

  logger.debug('Ensure Database Connection');
  await createDatabaseConnection();

  const posToCheck = await Pos.find({
    where: { hasMobileOrdering: true },
    order: { updatedAt: 'ASC' },
    take: 500,
  });

  const now = new Date();

  const newPosArray: Pos[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const pos of posToCheck) {
    const newPos = pos;
    logger.debug(`Checking Pos: ${pos.nationalStoreNumber}`);
    const posId = newPos.nationalStoreNumber;

    const countryInfo = CountryInfos[newPos.country];

    const storeApi = countryInfo.getStores.api;
    let bearerToken = '';
    if (storeApi === APIType.EU) {
      bearerToken = bearerTokenEU;
    } else if (storeApi === APIType.EL) {
      bearerToken = bearerTokenEL;
    } else if (storeApi === APIType.US) {
      bearerToken = bearerTokenUS;
    }

    let clientId = '';
    if (storeApi === APIType.EL) {
      clientId = clientIdEl;
    } else if (storeApi === APIType.US) {
      clientId = clientIdUs;
    }

    const { hasMilchshake, hasMcFlurry, hasMcSundae, status } =
      await checkForMaschine[storeApi](
        bearerToken,
        `${posId}`,
        newPos.country,
        clientId,
      );

    if (hasMilchshake === Availability.NOT_AVAILABLE) {
      if (newPos.hasMilchshake === Availability.NOT_AVAILABLE) {
        newPos.timeSinceBrokenMilchshake = now;
      }
    } else {
      newPos.timeSinceBrokenMilchshake = null;
    }
    newPos.hasMilchshake = hasMilchshake;

    if (hasMcFlurry === Availability.NOT_AVAILABLE) {
      if (newPos.hasMcFlurry === Availability.NOT_AVAILABLE) {
        newPos.timeSinceBrokenMcFlurry = now;
      }
    } else {
      newPos.timeSinceBrokenMcFlurry = null;
    }
    newPos.hasMcFlurry = hasMcFlurry;

    if (hasMcSundae === Availability.NOT_AVAILABLE) {
      if (newPos.hasMcSundae === Availability.NOT_AVAILABLE) {
        newPos.timeSinceBrokenMcSundae = now;
      }
    } else {
      newPos.timeSinceBrokenMcSundae = null;
    }
    newPos.hasMcSundae = hasMcSundae;

    newPos.restaurantStatus = status;
    newPos.lastCheck = now;

    newPosArray.push(newPos);
  }

  await Pos.save(newPosArray);
};
