import { Logger } from '@sailplane/logger'
import axios from 'axios'

import { InvalidUpstreamResponseError } from '../../clients/networkFailure'
import { getUpstreamRecord } from '../../clients/upstreamResponse'
import {
  BASIC_TOKEN_AP,
  BASIC_TOKEN_EL,
  BASIC_TOKEN_EU,
  BASIC_TOKEN_US
} from '../../constants'
import { MCDONALDS_USER_AGENT } from '../../constants/mcdonaldsIdentity'
import { APIType } from '../../types'

const logger = new Logger('getBearerToken')
// Two short retries absorb transient token read stalls without hiding sustained endpoint failures.
const MAX_TOKEN_REQUEST_ATTEMPTS = 3
const TOKEN_RETRY_BASE_DELAY_MS = 250
const TOKEN_REQUEST_TIMEOUT_MS = 10_000

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

function getTokenRequestConfig(basicToken: string) {
  return {
    headers: {
      authorization: `Basic ${basicToken}`,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': MCDONALDS_USER_AGENT
    },
    timeout: TOKEN_REQUEST_TIMEOUT_MS
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code
  }

  return undefined
}

function isReadTimeout(error: unknown): boolean {
  return ['ECONNABORTED', 'ETIMEDOUT'].includes(getErrorCode(error) ?? '')
}

export async function getBearerToken(apiType: APIType) {
  if ([APIType.UNKNOWN, APIType.HK].includes(apiType)) {
    throw new Error(`No bearer token available for this api ${apiType}`)
  }

  const { url, basicToken } = getBearerTokenMeta[apiType as BearerAPIType]

  if (!(url != null && basicToken != null)) {
    throw new Error(`url or basic token missing for ${apiType}`)
  }

  let attempt = 1

  while (true) {
    try {
      const { data } = await axios.post<unknown>(
        url,
        null,
        getTokenRequestConfig(basicToken)
      )
      const response = getUpstreamRecord(getUpstreamRecord(data)?.response)
      const token = response?.token
      if (typeof token !== 'string' || token.length === 0) {
        throw new InvalidUpstreamResponseError()
      }

      return token
    } catch (error) {
      if (attempt >= MAX_TOKEN_REQUEST_ATTEMPTS || !isReadTimeout(error)) {
        logger.error(`error getting new bearer token for ${apiType}`)
        throw error
      }

      const delayMs = TOKEN_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
      logger.warn(`retrying bearer token request for ${apiType}`, {
        attempt,
        maxAttempts: MAX_TOKEN_REQUEST_ATTEMPTS,
        delayMs,
        errorCode: getErrorCode(error)
      })
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      attempt++
    }
  }
}
