import { getStorelistEu } from '@mcbroken/core';

export const getAllStores = async () => {
  await getStorelistEu();

  return null;
};
