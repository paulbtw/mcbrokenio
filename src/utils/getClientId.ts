import { BASIC_TOKEN } from './constants';

export const getClientId = () => {
  if (BASIC_TOKEN == null) {
    throw new Error('You need to add a Basic Token');
  }

  const clientId = Buffer.from(BASIC_TOKEN, 'base64')
    .toString('utf-8')
    .split(':')[0];

  return clientId;
};
