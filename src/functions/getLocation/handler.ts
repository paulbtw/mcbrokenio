/* eslint-disable prefer-destructuring */
import { Logger } from '@sailplane/logger';
import { APIGatewayEvent, Handler } from 'aws-lambda';
import axios from 'axios';

const logger = new Logger('getLocation');

export interface IIPService {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export const main: Handler<APIGatewayEvent> = async (event) => {
  logger.debugObject('event', event);
  let ip = event.headers['x-forwarded-for'];
  if (!ip) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No IP address found',
      }),
    };
  }
  logger.debugObject('event ', ip);

  const splittedIp = ip.split(',');
  ip = splittedIp[0];

  const location = await axios.get<IIPService>(`http://ip-api.com/json/${ip}`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: true,
      lat: location.data.lat,
      lon: location.data.lon,
    }),
  };
};
