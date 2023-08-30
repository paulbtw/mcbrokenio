import {
  APIType,
  defaultRequestLimiterEu,
  getStorelistWithLocation,
  getStorelistWithUrl,
} from '@mcbroken/core';

export const getAllStores = async () => {
  await getStorelistWithLocation(APIType.EU, 50, defaultRequestLimiterEu);
  await getStorelistWithUrl(APIType.EL);

  return null;
};
