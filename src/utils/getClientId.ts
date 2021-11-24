export const getClientId = (BASIC_TOKEN: string | undefined) => {
  if (BASIC_TOKEN == null) {
    throw new Error('You need to add a Basic Token');
  }

  const clientId = Buffer.from(BASIC_TOKEN, 'base64')
    .toString('utf-8')
    .split(':')[0];

  return clientId;
};
