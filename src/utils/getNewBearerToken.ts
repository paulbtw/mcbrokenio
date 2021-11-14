import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { BASIC_TOKEN } from './constants';

const logger = new Logger('getNewBearerToken');

export const getNewBearerToken = async () => {
  if (!BASIC_TOKEN) {
    throw new Error('You need to add a Basic Token');
  }
  try {
    const refreshResponse = await axios.post(
      'https://eu-prod.api.mcd.com/v1/security/auth/token',
      null,
      {
        headers: {
          authorization: `Basic ${BASIC_TOKEN}`,
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
};
