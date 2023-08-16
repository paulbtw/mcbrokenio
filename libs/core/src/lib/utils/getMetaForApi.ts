import { CountryInfos } from '../constants/CountryInfos';
import { getBearerToken } from '../service/token/getBearerToken';
import { getClientId } from '../service/token/getClientId';
import { APIType, Locations } from '../types';

export async function getMetaForApi(
  apiType: APIType,
  countryList?: Locations[],
  generateToken = true,
) {
  let bearerToken = '';
  let clientId = '';

  if (generateToken) {
    bearerToken = await getBearerToken(apiType);
    clientId = getClientId(apiType);
  }

  const countryInfos_ = Object.entries(CountryInfos).filter(
    ([key, country]) =>
      country.getStores.api === apiType &&
      (!countryList || countryList.includes(key as unknown as Locations)),
  );

  return {
    token: bearerToken,
    clientId,
    countryInfos: countryInfos_.map((country) => country[1]),
  };
}
