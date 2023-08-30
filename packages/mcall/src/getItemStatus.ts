import {
  APIType,
  defaultRequestLimiterEu,
  getItemStatus,
} from '@mcbroken/core';

export const handler = async () => {
  await getItemStatus(APIType.EU, defaultRequestLimiterEu);

  return null;
};
