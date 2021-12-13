import { Connection, ConnectionOptions, createConnection } from 'typeorm';

import { Logger } from '@sailplane/logger';

import config from '../ormconfig';

const logger = new Logger('Database-Connection');

let dbConnection: Connection;

export const createDatabaseConnection = async (
  configOverride: Partial<ConnectionOptions> = {},
): Promise<Connection> => {
  if (!dbConnection) {
    logger.info('Creating database connection...');
    // @ts-ignore
    const ConnectionOptionsGenerate: ConnectionOptions = {
      ...(config as ConnectionOptions),
      ...configOverride,
    };

    dbConnection = await createConnection(ConnectionOptionsGenerate);
  } else if (!dbConnection.isConnected) {
    logger.info('Reconnecting database connection...');
    try {
      await dbConnection.close();
    } catch (error) {
      logger.error(error);
    }
  }

  return dbConnection;
};
