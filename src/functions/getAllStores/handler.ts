import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { createDatabaseConnection } from '../../utils';
import { getStoreListEL, getStoreListEU, getStoreListUS } from './utils';

const logger = new Logger('getAllStores');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Ensure Database Connection');
  await createDatabaseConnection();

  await getStoreListUS();
  await getStoreListEL();
  await getStoreListEU();
};
