import axios, { type AxiosInstance } from 'axios'

import { KEY } from '../constants'
import { type CreatePos, type ICountryInfos, type ILocation } from '../types'
import {
  type IRestaurantLocationResponse,
  type IRestaurantsUrlResponse
} from '../types/responses'
import { randomUserAgent } from '../utils/randomUserAgent'

const STORE_DISCOVERY_TIMEOUT_MS = 10_000

export interface StoreDiscoveryClient {
  discoverFromLocation(
    location: ILocation,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<CreatePos[]>
  discoverFromUrl(countryInfo: ICountryInfos): Promise<CreatePos[]>
}

export class AxiosStoreDiscoveryClient implements StoreDiscoveryClient {
  constructor(
    private readonly httpClient: AxiosInstance = axios,
    private readonly apiKey = KEY,
    private readonly createUserAgent: () => string | undefined = randomUserAgent
  ) {}

  async discoverFromLocation(
    { latitude, longitude }: ILocation,
    countryInfo: ICountryInfos,
    token: string,
    clientId: string
  ): Promise<CreatePos[]> {
    const { country, getStores } = countryInfo
    const {
      data: { response }
    } = await this.httpClient.get<IRestaurantLocationResponse>(
      `${getStores.url}latitude=${latitude}&longitude=${longitude}`,
      {
        timeout: STORE_DISCOVERY_TIMEOUT_MS,
        headers: {
          'User-Agent': this.createUserAgent(),
          authorization: `Bearer ${token}`,
          'mcd-clientid': clientId,
          'mcd-marketid': country,
          'mcd-uuid': '"',
          'accept-language': country === 'UK' ? 'en-GB' : 'de-DE'
        }
      }
    )

    return response.restaurants.map((restaurant) => ({
      id: `${country}-${restaurant.nationalStoreNumber}`,
      nationalStoreNumber: String(restaurant.nationalStoreNumber),
      name: restaurant.name,
      hasMobileOrdering:
        getStores.mobileString != null
          ? restaurant.facilities.includes(getStores.mobileString)
          : false,
      latitude: String(restaurant.location.latitude),
      longitude: String(restaurant.location.longitude),
      country
    }))
  }

  async discoverFromUrl(countryInfo: ICountryInfos): Promise<CreatePos[]> {
    const { country, getStores } = countryInfo
    const {
      data: { restaurants }
    } = await this.httpClient.get<IRestaurantsUrlResponse>(
      `${getStores.url}?acceptOffers=all&lab=false&key=${this.apiKey}`,
      { timeout: STORE_DISCOVERY_TIMEOUT_MS }
    )

    return restaurants.map((restaurant) => ({
      id: `${country}-${restaurant.rid}`,
      nationalStoreNumber: String(restaurant.rid),
      name: restaurant.addressLine1,
      hasMobileOrdering:
        getStores.mobileString != null
          ? restaurant.facilities.includes(getStores.mobileString)
          : false,
      latitude: String(restaurant.latitude),
      longitude: String(restaurant.longitude),
      country
    }))
  }
}

/**
 * Creates a client for discovering stores through location or URL endpoints.
 *
 * @param httpClient - Optional HTTP client override
 * @returns A Store Catalog discovery client
 */
export function createStoreDiscoveryClient(
  httpClient?: AxiosInstance
): StoreDiscoveryClient {
  return new AxiosStoreDiscoveryClient(httpClient)
}
