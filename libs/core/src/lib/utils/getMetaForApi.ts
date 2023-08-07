import { getBearerToken } from '../service/token/getBearerToken';
import { getClientId } from '../service/token/getClientId';
import { APIType } from '../types';

export async function getMetaForApi(apiType: APIType) {
  const bearerToken = await getBearerToken(apiType);
  const clientId = getClientId(apiType);

  return {
    token: bearerToken,
    clientId,
  };
}
