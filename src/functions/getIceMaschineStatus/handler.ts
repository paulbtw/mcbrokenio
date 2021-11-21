import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { Pos } from '../../entities';
import { Availability, Locations } from '../../types';
import { createDatabaseConnection, getNewBearerToken } from '../../utils';
import { checkForMaschine } from './utils';

const logger = new Logger('getIceMaschineStatus');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Get new Bearer token');
  const bearerToken = await getNewBearerToken();
  logger.debug('new Token: ', bearerToken);

  logger.debug('Ensure Database Connection');
  const connection = await createDatabaseConnection();

  const posToCheck = await Pos.find({
    where: { country: Locations.DE, hasMobileOrdering: true },
    order: { updatedAt: 'ASC' },
    take: 250,
  });

  const now = new Date();

  // eslint-disable-next-line no-restricted-syntax
  for await (const pos of posToCheck) {
    logger.debugObject('Checking Pos: ', pos);
    const posId = pos.nationalStoreNumber;

    const { hasMilchshake, hasMcFlurry, hasMcSundae, status } =
      await checkForMaschine(bearerToken, posId);

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

  if (connection.isConnected) {
    logger.debug('Closing DB connection');
    await connection.close();
  }
};
