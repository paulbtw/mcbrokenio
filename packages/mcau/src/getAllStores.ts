import {
  APIType,
  Locations,
  defaultRequestLimiterAu,
  getStorelistWithLocation,
} from '@mcbroken/core';
import { Handler } from 'aws-lambda';

export const getAllStores: Handler<{ key: Locations }> = async ({ key }) => {
  await getStorelistWithLocation(
    APIType.AP,
    30,
    defaultRequestLimiterAu,
    key ? [key] : undefined,
  );

  return null;
};
