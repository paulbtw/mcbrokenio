import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { PosMemory } from '../../entities';
import { createDatabaseConnection } from '../../utils';

const logger = new Logger('cleanupDatabase');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);
  const connection = await createDatabaseConnection();

  const deleted = await PosMemory.createQueryBuilder()
    .delete()
    .where('"createdAt" < NOW() - INTERVAL \'90 days\'')
    .execute();

  logger.debugObject('Deleted: ', deleted.affected);

  if (connection.isConnected) {
    await connection.close();
  }
};
