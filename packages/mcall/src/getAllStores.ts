import {
  APIType,
  getStorelistWithLocation,
  getStorelistWithUrl,
} from '@mcbroken/core';

export const getAllStores = async () => {
  await getStorelistWithLocation(APIType.EU);
  await getStorelistWithUrl(APIType.EL);

  return null;
};
