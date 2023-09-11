import axios from 'axios'
import { type CreatePos, type ICountryInfos, type ILocation } from '@libs/types'
import { type IRestaurantLocationResponse } from '@libs/types/responses'
import { Logger } from '@sailplane/logger'
import { randomUserAgent } from '@libs/utils/randomUserAgent'

const logger = new Logger('getStoreListForLocation')

export async function getStorelistFromLocation(
  { latitude, longitude }: ILocation,
  { country, getStores: { url, mobileString } }: ICountryInfos,
  token: string,
  clientId: string
) {
  try {
    const {
      data: { response }
    } = await axios.get<IRestaurantLocationResponse>(
      `${url}latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          'User-Agent': randomUserAgent(),
          authorization: `Bearer ${token}`,
          'mcd-clientid': clientId,
          'mcd-marketid': country,
          'mcd-uuid': '"', // needs to be a truthy value
          'accept-language': country === 'UK' ? 'en-GB' : 'de-DE'
        }
      }
    )

    const posArray: CreatePos[] = response.restaurants.map((restaurant) => {
      const pos: CreatePos = {
        id: `${country}-${restaurant.nationalStoreNumber}`,
        nationalStoreNumber: `${restaurant.nationalStoreNumber}`,
        name: restaurant.name,
        hasMobileOrdering: mobileString != null
          ? restaurant.facilities.includes(mobileString)
          : false,
        latitude: restaurant.location.latitude.toString(),
        longitude: restaurant.location.longitude.toString(),
        country
      }

      return pos
    })

    return posArray
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error

      if (axiosError.response?.status === 401) {
        logger.warn('Bad request error')
      } else {
        logger.error(
          `Error while getting stores for location ${latitude}, ${longitude} in ${country}: ${axiosError.response?.statusText}`
        )
      }
    }

    logger.error('Error while getting stores for location, no axios error')
  }

  return [] as CreatePos[]
}
