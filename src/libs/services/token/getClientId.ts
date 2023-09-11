import { API_KEY_AP, BASIC_TOKEN_AP, BASIC_TOKEN_EL, BASIC_TOKEN_EU, BASIC_TOKEN_US } from '@libs/constants'
import { APIType } from '@libs/types'

const getClientIdWithToken = (BASIC_TOKEN: string | undefined) => {
  if (BASIC_TOKEN == null) {
    throw new Error('Basic token is missing')
  }

  const clientId = Buffer.from(BASIC_TOKEN, 'base64')
    .toString('utf-8')
    .split(':')[0]

  return clientId
}

export const getClientIdMap: Record<
APIType,
string | undefined
> = {
  [APIType.AP]: BASIC_TOKEN_AP,
  [APIType.EL]: BASIC_TOKEN_EL,
  [APIType.EU]: BASIC_TOKEN_EU,
  [APIType.HK]: API_KEY_AP,
  [APIType.US]: BASIC_TOKEN_US,
  [APIType.UNKNOWN]: undefined
}

export function getClientId(apiType: APIType) {
  const token = getClientIdMap[apiType]

  if (token == null) {
    throw new Error('Unknown API type')
  }

  if (apiType === APIType.HK) {
    return token
  }

  return getClientIdWithToken(token)
}
