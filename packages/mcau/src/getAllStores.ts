import { APIType, Locations, getStorelistWithLocation } from '@mcbroken/core';
import { Handler } from 'aws-lambda';

export const getAllStores: Handler<{ key: Locations }> = async ({ key }) => {
  await getStorelistWithLocation(APIType.AP, 30, key ? [key] : undefined);

  return null;
};
