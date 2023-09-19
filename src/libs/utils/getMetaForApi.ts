import { CountryInfos } from '@libs/constants'
import { getBearerToken } from '@libs/services/token/getBearerToken'
import { getClientId } from '@libs/services/token/getClientId'
import { type APIType, type Locations } from '@libs/types'

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

  const countryInfos_ = Object.entries(CountryInfos).filter(
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
