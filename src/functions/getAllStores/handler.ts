import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { createDatabaseConnection } from '../../utils';
import { getStoreListEL, getStoreListEU } from './utils';

const logger = new Logger('getAllStores');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Ensure Database Connection');
  const connection = await createDatabaseConnection();

  await getStoreListEL();
  await getStoreListEU();

  if (connection.isConnected) {
    logger.debug('Closing Database Connection');
    // await connection.close();
  }
};
