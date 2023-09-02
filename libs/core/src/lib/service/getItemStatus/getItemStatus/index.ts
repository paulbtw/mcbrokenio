import { Pos } from '@prisma/client';
import { APIType, ICountryInfos } from '../../../types';
import { GetItemStatus, getItemStatusEu } from './getItemStatusEu';

export const getItemStatus: Record<
  APIType,
  (
    pos: Pos,
    countriesRecord: Record<string, ICountryInfos>,
    token: string,
    clientId: string,
  ) => Promise<GetItemStatus | null>
> = {
  [APIType.AP]: () => {
    throw new Error('Not implemented');
  },
  [APIType.EL]: () => {
    throw new Error('Not implemented');
  },
  [APIType.EU]: getItemStatusEu,
  [APIType.HK]: () => {
    throw new Error('Not implemented');
  },
  [APIType.UNKNOWN]: () => {
    throw new Error('Not implemented');
  },
  [APIType.US]: () => {
    throw new Error('Not implemented');
  },
};
