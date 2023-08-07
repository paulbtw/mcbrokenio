import axios from 'axios';
import {
  BASIC_TOKEN_AP,
  BASIC_TOKEN_EL,
  BASIC_TOKEN_EU,
  BASIC_TOKEN_US,
} from '../../constants';
import { APIType } from '../../types';
import { Logger } from '@sailplane/logger';

const logger = new Logger('getBearerToken');

type BearerAPIType = Exclude<APIType, APIType.UNKNOWN | APIType.HK>;

export const getBearerTokenMeta: Record<
  BearerAPIType,
  { url: string; basicToken: string }
> = {
  [APIType.AP]: {
    url: 'https://ap-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_AP,
  },
  [APIType.EL]: {
    url: 'https://el-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_EL,
  },
  [APIType.EU]: {
    url: 'https://eu-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_EU,
  },
  [APIType.US]: {
    url: 'https://us-prod.api.mcd.com/v1/security/auth/token',
    basicToken: BASIC_TOKEN_US,
  },
};

function getHeaders(basicToken: string) {
  return {
    headers: {
      authorization: `Basic ${basicToken}`,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  };
}

export async function getBearerToken(apiType: APIType) {
  if ([APIType.UNKNOWN, APIType.HK].includes(apiType)) {
    throw new Error(`No bearer token available for this api ${apiType}`);
  }

  const { url, basicToken } = getBearerTokenMeta[apiType];

  if (!(url && basicToken))
    throw new Error(`url or basic token missing for ${apiType}`);

  try {
    const { data } = await axios.post(url, null, getHeaders(basicToken));

    return data.response.token;
  } catch (error) {
    logger.error(`error getting new bearer token for ${apiType}`);
  }
}
