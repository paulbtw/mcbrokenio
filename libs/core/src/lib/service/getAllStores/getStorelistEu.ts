import { Logger } from '@sailplane/logger';
import { APIType } from '../../types';
import { getMetaForApi } from '../../utils/getMetaForApi';

const logger = new Logger('StoreListEu');

export async function getStorelistEu() {
  const { token, clientId } = await getMetaForApi(APIType.EU);

  logger.debug(token);
  logger.debug(clientId);

  return null;
}
