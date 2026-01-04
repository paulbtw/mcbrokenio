import { CountryInfos } from '../constants/CountryInfos'
import { getBearerToken } from '../services/token/getBearerToken'
import { getClientId } from '../services/token/getClientId'
import { type APIType, type ICountryInfos,type Locations } from '../types'

export async function getMetaForApi(
  apiType: APIType,
  countryList?: Locations[],
  generateToken = true
) {
  let bearerToken = ''
  let clientId = ''

  if (generateToken) {
    bearerToken = await getBearerToken(apiType)
    clientId = getClientId(apiType)
  }

  const countryInfos_ = Object.entries(CountryInfos as unknown as Record<Locations, ICountryInfos>).filter(
    ([key, country]) =>
      country.getStores.api === apiType &&
      ((countryList == null) || countryList.includes(key as unknown as Locations))
  )

  return {
    token: bearerToken,
    clientId,
    countryInfos: countryInfos_.map((country) => country[1])
  }
}
