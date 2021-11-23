import {
  checkForMaschineEU,
  checkForMaschineEL,
  checkForMaschineUNKNOWN,
} from '.';
import { APIType, Availability, Locations } from '../../../types';
import { checkForMaschineUS } from './checkForMaschineUS';

export const checkForMaschine: Record<
  APIType,
  (
    bearerToken: string,
    posId: string,
    country: Locations,
    clientId?: string,
  ) => Promise<{
    hasMcFlurry: Availability;
    hasMcSundae: Availability;
    hasMilchshake: Availability;
    status: string;
  }>
> = {
  [APIType.EU]: (bearerToken, posId, location) =>
    checkForMaschineEU(bearerToken, posId, location),
  [APIType.EL]: (bearerToken, posId, location, clientId) =>
    checkForMaschineEL(bearerToken, posId, location, clientId),
  [APIType.UNKNOWN]: (bearerToken, posId, location) =>
    checkForMaschineUNKNOWN(bearerToken, posId, location),
  [APIType.US]: (bearerToken, posId, location, clientId) =>
    checkForMaschineUS(bearerToken, posId, location, clientId),
};
