import { Availability, Locations } from '../../../types';

export const checkForMaschineUS = async (
  bearerToken: string,
  nationalStoreNumber: string,
  location: Locations,
) => ({
  hasMilchshake: Availability.UNKNOWN,
  hasMcSundae: Availability.UNKNOWN,
  hasMcFlurry: Availability.UNKNOWN,
  status: 'UNKNOWN',
});
