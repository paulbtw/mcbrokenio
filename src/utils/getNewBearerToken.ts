import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { APIType } from '../types';
import { BASIC_TOKEN_EU, BASIC_TOKEN_EL } from './constants';

const logger = new Logger('getNewBearerToken');

export const getNewBearerToken = async (api: APIType) => {
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
      logger.debugObject('refresh response: ', requestData);

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
      throw error;
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
      logger.debugObject('refresh response: ', requestData);

      return requestData.response.token;
    } catch (error) {
      logger.error('error getting new bearer token', error);
      throw error;
    }
  }

  throw new Error('Invalid API Type');
};
