import { KEY } from '@libs/constants'
import { type CreatePos, type ICountryInfos } from '@libs/types'
import { type IRestaurantsUrlResponse } from '@libs/types/responses'
import { Logger } from '@sailplane/logger'
import axios from 'axios'

const logger = new Logger('getStorelistFromUrl')

export async function getStorelistFromUrl({
  country,
  getStores: { url, mobileString }
}: ICountryInfos) {
  try {
    const {
      data: { restaurants }
    } = await axios.get<IRestaurantsUrlResponse>(
      `${url}?acceptOffers=all&lab=false&key=${KEY}`
    )

    const posArray: CreatePos[] = restaurants.map((restaurant) => {
      const pos: CreatePos = {
        id: `${country}-${restaurant.rid}`,
        nationalStoreNumber: `${restaurant.rid}`,
        name: restaurant.addressLine1,
        hasMobileOrdering: (mobileString != null)
          ? restaurant.facilities.includes(mobileString)
          : false,
        latitude: restaurant.latitude.toString(),
        longitude: restaurant.longitude.toString(),
        country
      }

      return pos
    })

    return posArray
  } catch (error) {
    logger.error('Error while getting storelist from url')
  }
}
