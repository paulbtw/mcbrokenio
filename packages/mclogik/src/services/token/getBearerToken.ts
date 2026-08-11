import { Logger } from '@sailplane/logger'
import axios from 'axios'

import { InvalidUpstreamResponseError } from '../../clients/networkFailure'
import {
  BASIC_TOKEN_AP,
  BASIC_TOKEN_EL,
  BASIC_TOKEN_EU,
  BASIC_TOKEN_US
} from '../../constants'
import { APIType } from '../../types'

const logger = new Logger('getBearerToken')

type JsonRecord = Record<string, unknown>

function getRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}

type BearerAPIType = Exclude<APIType, APIType.UNKNOWN | APIType.HK>

export const getBearerTokenMeta: Record<
  BearerAPIType,
  { url: string; basicToken?: string }
> = {
  [APIType.AP]: {
    url: 'https://ap-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_AP
  },
  [APIType.EL]: {
    url: 'https://el-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_EL
  },
  [APIType.EU]: {
    url: 'https://eu-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_EU
  },
  [APIType.US]: {
    url: 'https://us-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_US
  }
}

function getHeaders(basicToken: string) {
  return {
    headers: {
      authorization: `Basic ${basicToken}`,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }
}

export async function getBearerToken(apiType: APIType) {
  if ([APIType.UNKNOWN, APIType.HK].includes(apiType)) {
    throw new Error(`No bearer token available for this api ${apiType}`)
  }

  const { url, basicToken } = getBearerTokenMeta[apiType as BearerAPIType]

  if (!(url != null && basicToken != null)) {
    throw new Error(`url or basic token missing for ${apiType}`)
  }

  try {
    const { data } = await axios.post<unknown>(
      url,
      null,
      getHeaders(basicToken)
    )
    const response = getRecord(getRecord(data)?.response)
    const token = response?.token
    if (typeof token !== 'string' || token.length === 0) {
      throw new InvalidUpstreamResponseError()
    }

    return token
  } catch (error) {
    logger.error(`error getting new bearer token for ${apiType}`)
    throw error
  }
}
