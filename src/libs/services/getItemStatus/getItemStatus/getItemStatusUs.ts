import { checkForProduct } from '@libs/services/getItemStatus/checkForProduct'
import { type ICountryInfos } from '@libs/types'
import { type RestaurantInfoUsResponse } from '@libs/types/responses'
import { type ItemStatus as ItemStatusPrisma, type Pos } from '@prisma/client'
import { Logger } from '@sailplane/logger'
import axios from 'axios'

const logger = new Logger('getStore')

export interface ItemStatus {
  status: ItemStatusPrisma
  count: number
  unavailable: number
  name?: string
}

export interface GetItemStatus {
  milkshake: ItemStatus
  mcFlurry: ItemStatus
  mcSundae: ItemStatus
  custom: ItemStatus[]
}

export async function getItemStatusUs(
  pos: Pos,
  countriesRecord: Record<string, ICountryInfos>,
  token: string,
  clientId: string
): Promise<GetItemStatus | null> {
  try {
    const countryInfo = countriesRecord[pos.country]

    const { data } = await axios.get<RestaurantInfoUsResponse>(
      `https://us-prod.api.mcd.com/exp/v1/restaurant/${pos.nationalStoreNumber}?filter=full&storeUniqueIdType=NatlStrNumber`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'mcd-clientId': clientId,
          'mcd-sourceapp': 'GMA',
          'mcd-marketid': pos.country,
          'mcd-uuid': '"',
          'accept-language': 'en-US'
        }
      }
    )

    const outageProductCodes =
      data.response?.restaurant?.catalog?.outageProductCodes ?? []

    const milkshakeCodes = countryInfo.productCodes.MILCHSHAKE
    const mcFlurryCodes = countryInfo.productCodes.MCFLURRY
    const mcSundaeCodes = countryInfo.productCodes.MCSUNDAE
    const customCodes = countryInfo.customItems ?? {}

    const milkshake = checkForProduct(outageProductCodes, milkshakeCodes)
    const mcFlurry = checkForProduct(outageProductCodes, mcFlurryCodes)
    const mcSundae = checkForProduct(outageProductCodes, mcSundaeCodes)
    const custom = Object.entries(customCodes).map(([name, codes]) => ({
      name,
      ...checkForProduct(outageProductCodes, codes)
    }))

    return {
      milkshake,
      mcFlurry,
      mcSundae,
      custom
    }
  } catch (error) {
    // check if error is AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error

      if (axiosError.response?.status === 401) {
        logger.warn('Bad request error')
      } else {
        logger.error('Error while getting store status ')
      }
    }

    logger.error(
      'Error while getting stores for location, no axios error',
      pos.id
    )
  }

  return null
}
