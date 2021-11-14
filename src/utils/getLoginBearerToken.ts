import { Logger } from '@sailplane/logger';
import axios from 'axios';
import { MCD_DEVICEID, MCD_PASSWORD, MCD_USERNAME } from '.';

const logger = new Logger('getNewBearerToken');

export const getLoginBearerToken = async (
  bearerToken: string,
  clientId: string,
) => {
  if (!MCD_PASSWORD || !MCD_USERNAME || !MCD_DEVICEID) {
    throw new Error('You need to add Username, Password');
  }
  try {
    const loginResponse = await axios.post(
      'https://eu-prod.api.mcd.com/exp/v1/customer/login',
      {
        credentials: {
          type: 'email',
          loginUsername: MCD_USERNAME,
          password: MCD_PASSWORD,
        },
        deviceId: MCD_DEVICEID,
      },
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          'mcd-clientid': clientId,
          'mcd-sourceapp': 'GMA',
          'mcd-uuid': MCD_DEVICEID, // can be any uppercase uuid v4
          'accept-language': 'de-DE',
        },
      },
    );

    const requestData = loginResponse.data;
    logger.debugObject('login response: ', requestData);

    return requestData.response.accessToken;
  } catch (error) {
    logger.error('Error getting new bearer token: ', error);
    throw error;
  }
};
