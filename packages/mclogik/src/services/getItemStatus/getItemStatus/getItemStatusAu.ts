import { type ItemStatus as ItemStatusPrisma, type Pos } from '@mcbroken/db'
import axios from 'axios'

import { type ICountryInfos } from '../../../types'
import { type RestaurantInfoEuResponse } from '../../../types/responses'
import { checkForProduct } from '../checkForProduct'

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

export async function getItemStatusAu(
  pos: Pos,
  countriesRecord: Record<string, ICountryInfos>,
  token: string,
  clientId: string
): Promise<GetItemStatus | null> {
  try {
    const countryInfo = countriesRecord[pos.country]

    const { data } = await axios.get<RestaurantInfoEuResponse>(
      `https://ap-prod.api.mcd.com/exp/v1/restaurant/${pos.nationalStoreNumber}?filter=full&storeUniqueIdType=NSN`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'mcd-clientId': clientId,
          'mcd-sourceapp': 'GMA',
          'mcd-marketid': pos.country,
          'mcd-uuid': '"',
          'accept-language': 'en-AU'
        }
      }
    )

    if (countryInfo == null) {
      return null
    }

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
  } catch {
    // Errors are tracked via batch summary in the orchestrator
  }

  return null
}
