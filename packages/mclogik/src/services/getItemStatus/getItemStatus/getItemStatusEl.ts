import { type ItemStatus as ItemStatusPrisma, type Pos } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'
import axios from 'axios'

import { type ICountryInfos } from '../../../types'
import { type RestaurantStatusResponse } from '../../../types/responses'
import { checkForProduct } from '../checkForProduct'

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

export async function getItemStatusEl(
  pos: Pos,
  countriesRecord: Record<string, ICountryInfos>,
  token: string,
  clientId: string
): Promise<GetItemStatus | null> {
  try {
    const countryInfo = countriesRecord[pos.country]

    if (countryInfo == null) {
      return null
    }

    const { data } = await axios.get<RestaurantStatusResponse>(
      `https://el-prod.api.mcd.com/exp/v1/menu/gmal/restaurants/${pos.nationalStoreNumber}/status`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'mcd-clientid': clientId,
          'mcd-sourceapp': 'GMAL'
        }
      }
    )

    const outageProductCodes =
      data.productOutages.productIDs ?? []
    const outagesProductCodesString = outageProductCodes.map((code) => {
      return code.toString()
    })

    const milkshakeCodes = countryInfo.productCodes.MILCHSHAKE
    const mcFlurryCodes = countryInfo.productCodes.MCFLURRY
    const mcSundaeCodes = countryInfo.productCodes.MCSUNDAE
    const customCodes = countryInfo.customItems ?? {}

    const milkshake = checkForProduct(outagesProductCodesString, milkshakeCodes)
    const mcFlurry = checkForProduct(outagesProductCodesString, mcFlurryCodes)
    const mcSundae = checkForProduct(outagesProductCodesString, mcSundaeCodes)
    const custom = Object.entries(customCodes).map(([name, codes]) => ({
      name,
      ...checkForProduct(outagesProductCodesString, codes)
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
