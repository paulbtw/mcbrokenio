import { type AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import {
  APIType,
  IceType,
  type ICountryInfos,
  UsLocations
} from '../types'

import { AxiosStoreDiscoveryClient } from './StoreDiscoveryClient'

function createCountryInfo(): ICountryInfos {
  return {
    country: UsLocations.US,
    getStores: {
      api: APIType.US,
      url: 'https://example.com/stores?',
      mobileString: 'MOBILEORDERS'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  }
}

describe('AxiosStoreDiscoveryClient', () => {
  it('maps location discovery responses to Store Catalog entries', async () => {
    const httpClient = {
      get: vi.fn().mockResolvedValue({
        data: {
          response: {
            restaurants: [
              {
                nationalStoreNumber: 123,
                name: 'Market Street',
                facilities: ['MOBILEORDERS'],
                location: { latitude: 40.5, longitude: -70.5 }
              }
            ]
          }
        }
      })
    } as unknown as AxiosInstance
    const client = new AxiosStoreDiscoveryClient(httpClient, 'key', () => 'ua')
    const countryInfo = createCountryInfo()

    const stores = await client.discoverFromLocation(
      { latitude: 40, longitude: -70 },
      countryInfo,
      'token',
      'client-id'
    )

    expect(httpClient.get).toHaveBeenCalledWith(
      'https://example.com/stores?latitude=40&longitude=-70',
      {
        headers: expect.objectContaining({
          authorization: 'Bearer token',
          'mcd-clientid': 'client-id',
          'mcd-marketid': 'US',
          'User-Agent': 'ua'
        })
      }
    )
    expect(stores).toEqual([
      expect.objectContaining({
        id: 'US-123',
        nationalStoreNumber: '123',
        name: 'Market Street',
        hasMobileOrdering: true,
        latitude: '40.5',
        longitude: '-70.5',
        country: 'US'
      })
    ])
  })

  it('maps URL discovery responses and uses the configured key', async () => {
    const httpClient = {
      get: vi.fn().mockResolvedValue({
        data: {
          restaurants: [
            {
              rid: 456,
              addressLine1: 'Main Road',
              facilities: [],
              latitude: 41,
              longitude: -71
            }
          ]
        }
      })
    } as unknown as AxiosInstance
    const client = new AxiosStoreDiscoveryClient(httpClient, 'secret-key')
    const countryInfo = createCountryInfo()

    const stores = await client.discoverFromUrl(countryInfo)

    expect(httpClient.get).toHaveBeenCalledWith(
      'https://example.com/stores??acceptOffers=all&lab=false&key=secret-key'
    )
    expect(stores).toEqual([
      expect.objectContaining({
        id: 'US-456',
        nationalStoreNumber: '456',
        name: 'Main Road',
        hasMobileOrdering: false
      })
    ])
  })

  it('marks stores untrackable when no mobile-ordering marker is configured', async () => {
    const httpClient = {
      get: vi.fn().mockResolvedValue({
        data: {
          response: {
            restaurants: [
              {
                nationalStoreNumber: 123,
                name: 'Store',
                facilities: ['MOBILEORDERS'],
                location: { latitude: 1, longitude: 2 }
              }
            ]
          }
        }
      })
    } as unknown as AxiosInstance
    const countryInfo = createCountryInfo()
    delete countryInfo.getStores.mobileString
    const client = new AxiosStoreDiscoveryClient(httpClient)

    const [store] = await client.discoverFromLocation(
      { latitude: 1, longitude: 2 },
      countryInfo,
      'token',
      'client'
    )

    expect(store?.hasMobileOrdering).toBe(false)
  })

  it('propagates discovery errors for refresh failure accounting', async () => {
    const error = new Error('network unavailable')
    const httpClient = {
      get: vi.fn().mockRejectedValue(error)
    } as unknown as AxiosInstance
    const client = new AxiosStoreDiscoveryClient(httpClient)

    await expect(client.discoverFromUrl(createCountryInfo())).rejects.toBe(error)
  })
})
