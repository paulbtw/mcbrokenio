import {
  checkForMaschineEU,
  checkForMaschineEL,
  checkForMaschineUNKNOWN,
  checkForMaschineAP,
  checkForMaschineUS,
  checkForMaschineHK,
} from '.';
import { APIType, Availability, Locations } from '../../../types';

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
  [APIType.EU]: (bearerToken, posId, location, clientId) =>
    checkForMaschineEU(bearerToken, posId, location, clientId),
  [APIType.EL]: (bearerToken, posId, location, clientId) =>
    checkForMaschineEL(bearerToken, posId, location, clientId),
  [APIType.UNKNOWN]: (bearerToken, posId, location) =>
    checkForMaschineUNKNOWN(bearerToken, posId, location),
  [APIType.US]: (bearerToken, posId, location, clientId) =>
    checkForMaschineUS(bearerToken, posId, location, clientId),
  [APIType.AP]: (bearerToken, posId, location, clientId) =>
    checkForMaschineAP(bearerToken, posId, location, clientId),
  [APIType.HK]: (bearerToken, posId, location, clientId) =>
    checkForMaschineHK(bearerToken, posId, location, clientId),
};
