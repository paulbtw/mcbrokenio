import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { APIType } from '../types';
import {
  BASIC_TOKEN_EU,
  BASIC_TOKEN_EL,
  BASIC_TOKEN_US,
  BASIC_TOKEN_AP,
} from '.';

const logger = new Logger('getNewBearerToken');

/**
 *
 * @param api The API to get the token for
 * @returns An access token for the given API
 */
export const getNewBearerToken = async (api: APIType): Promise<string> => {
  if (api === APIType.EU) {
    if (!BASIC_TOKEN_EU) {
      throw new Error('You need to add a Basic Token');
    }

    try {
      const refreshResponse = await axios.post(
        'https://eu-prod.api.mcd.com/v1/security/auth/token',
        null,
        {
          headers: {
            authorization: `Basic ${BASIC_TOKEN_EU}`,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );

      const requestData = refreshResponse.data;

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
    }
  }
  if (api === APIType.EL) {
    if (!BASIC_TOKEN_EL) {
      throw new Error('You need to add a Basic Token');
    }

    try {
      const refreshResponse = await axios.post(
        'https://el-prod.api.mcd.com/v1/security/auth/token',
        null,
        {
          headers: {
            authorization: `Basic ${BASIC_TOKEN_EL}`,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );

      const requestData = refreshResponse.data;

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
    }
  }

  if (api === APIType.US) {
    if (!BASIC_TOKEN_US) {
      throw new Error('You need to add a Basic Token');
    }

    try {
      const refreshResponse = await axios.post(
        'https://us-prod.api.mcd.com/v1/security/auth/token',
        null,
        {
          headers: {
            authorization: `Basic ${BASIC_TOKEN_US}`,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );

      const requestData = refreshResponse.data;

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
    }
  }

  if (api === APIType.AP) {
    if (!BASIC_TOKEN_AP) {
      throw new Error('You need to add a Basic Token');
    }

    try {
      const refreshResponse = await axios.post(
        'https://ap-prod.api.mcd.com/v1/security/auth/token',
        null,
        {
          headers: {
            authorization: `Basic ${BASIC_TOKEN_AP}`,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );

      const requestData = refreshResponse.data;

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
    }
  }

  throw new Error('Invalid API Type');
};
