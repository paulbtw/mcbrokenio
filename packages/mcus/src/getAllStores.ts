import { APIType, getStorelistWithLocation } from '@mcbroken/core';
import { Logger } from '@sailplane/logger';

const logger = new Logger({ module: 'mcus:getAllStores', logTimestamps: true });

export const getAllStores = async () => {
  logger.info('Getting all stores');

  await getStorelistWithLocation(APIType.US, 30);

  logger.info('Done getting all stores');

  return null;
};
