import axios, { type AxiosInstance } from 'axios'

import { KEY } from '../constants'
import { type CreatePos, type ICountryInfos, type ILocation } from '../types'
import { randomUserAgent } from '../utils/randomUserAgent'

import { InvalidUpstreamResponseError } from './networkFailure'

const STORE_DISCOVERY_TIMEOUT_MS = 10_000

type JsonRecord = Record<string, unknown>

function getRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}

function requireRestaurantCollection(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

function requireStoreIdentifier(value: unknown): string | number {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

function requireString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

function requireNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

function requireFacilities(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((facility): facility is string => typeof facility === 'string')
  ) {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

function mapLocationRestaurant(
  value: unknown,
  countryInfo: ICountryInfos
): CreatePos {
  const restaurant = getRecord(value)
  const location = getRecord(restaurant?.location)
  const identifier = requireStoreIdentifier(restaurant?.nationalStoreNumber)
  const facilities = requireFacilities(restaurant?.facilities)
  const { country, getStores } = countryInfo

  return {
    id: `${country}-${identifier}`,
    nationalStoreNumber: String(identifier),
    name: requireString(restaurant?.name),
    hasMobileOrdering:
      getStores.mobileString != null
        ? facilities.includes(getStores.mobileString)
        : false,
    latitude: String(requireNumber(location?.latitude)),
    longitude: String(requireNumber(location?.longitude)),
    country
  }
}

function mapUrlRestaurant(
  value: unknown,
  countryInfo: ICountryInfos
): CreatePos {
  const restaurant = getRecord(value)
  const identifier = requireStoreIdentifier(restaurant?.rid)
  const facilities = requireFacilities(restaurant?.facilities)
  const { country, getStores } = countryInfo

  return {
    id: `${country}-${identifier}`,
    nationalStoreNumber: String(identifier),
    name: requireString(restaurant?.addressLine1),
    hasMobileOrdering:
      getStores.mobileString != null
        ? facilities.includes(getStores.mobileString)
        : false,
    latitude: String(requireNumber(restaurant?.latitude)),
    longitude: String(requireNumber(restaurant?.longitude)),
    country
  }
}

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
    const { data } = await this.httpClient.get<unknown>(
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

    const response = getRecord(getRecord(data)?.response)
    const restaurants = requireRestaurantCollection(response?.restaurants)

    return restaurants.map((restaurant) =>
      mapLocationRestaurant(restaurant, countryInfo)
    )
  }

  async discoverFromUrl(countryInfo: ICountryInfos): Promise<CreatePos[]> {
    const { getStores } = countryInfo
    const { data } = await this.httpClient.get<unknown>(
      `${getStores.url}?acceptOffers=all&lab=false&key=${this.apiKey}`,
      { timeout: STORE_DISCOVERY_TIMEOUT_MS }
    )

    const restaurants = requireRestaurantCollection(
      getRecord(data)?.restaurants
    )

    return restaurants.map((restaurant) =>
      mapUrlRestaurant(restaurant, countryInfo)
    )
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
