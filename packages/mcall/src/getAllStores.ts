import {
  APIType,
  getStorelistWithLocation,
  getStorelistWithUrl,
} from '@mcbroken/core';

export const getAllStores = async () => {
  await getStorelistWithLocation(APIType.EU, 75);
  await getStorelistWithUrl(APIType.EL);

  return null;
};
