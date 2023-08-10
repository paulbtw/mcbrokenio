import { CountryInfos } from '../constants/CountryInfos';
import { getBearerToken } from '../service/token/getBearerToken';
import { getClientId } from '../service/token/getClientId';
import { APIType } from '../types';

export async function getMetaForApi(apiType: APIType) {
  const bearerToken = await getBearerToken(apiType);
  const clientId = getClientId(apiType);
  const countryInfo = Object.values(CountryInfos).filter(
    (country) => country.getStores.api === apiType,
  );

  return {
    token: bearerToken,
    clientId,
    countryInfo,
  };
}
