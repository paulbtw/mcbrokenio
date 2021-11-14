import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { Pos } from '../../entities';
import { Locations } from '../../types';
import {
  createDatabaseConnection,
  getNewBearerToken,
  checkForMaschine,
} from '../../utils';

const logger = new Logger('getIceMaschineStatus');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Get new Bearer token');
  const bearerToken = await getNewBearerToken();
  logger.debug('new Token: ', bearerToken);

  logger.debug('Ensure Database Connection');
  const connection = await createDatabaseConnection();

  const posToCheck = await Pos.find({
    where: { country: Locations.DE },
    order: { updatedAt: 'ASC' },
    take: 250,
  });

  // eslint-disable-next-line no-restricted-syntax
  for await (const pos of posToCheck) {
    logger.debugObject('Checking Pos: ', pos);
    const posId = pos.nationalStoreNumber;

    const { hasMilchshake, hasMcFlurry, hasMcSundae, status } =
      await checkForMaschine(bearerToken, posId);

    if (hasMilchshake === false) {
      if (pos.hasMilchshake === false) {
        pos.timeSinceBrokenMilchshake = new Date();
      }
    } else {
      pos.timeSinceBrokenMilchshake = null;
    }
    pos.hasMilchshake = hasMilchshake;

    if (hasMcFlurry === false) {
      if (pos.hasMcFlurry === false) {
        pos.timeSinceBrokenMcFlurry = new Date();
      }
    } else {
      pos.timeSinceBrokenMcFlurry = null;
    }
    pos.hasMcFlurry = hasMcFlurry;

    if (hasMcSundae === false) {
      if (pos.hasMcSundae === false) {
        pos.timeSinceBrokenMcSundae = new Date();
      }
    } else {
      pos.timeSinceBrokenMcSundae = null;
    }
    pos.hasMcSundae = hasMcSundae;

    pos.restaurantStatus = status;
    pos.lastCheck = new Date();

    await pos.save();
  }

  if (connection.isConnected) {
    logger.debug('Closing DB connection');
    await connection.close();
  }
};
