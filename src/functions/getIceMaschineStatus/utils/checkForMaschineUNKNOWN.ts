import { Availability, Locations } from '../../../types';

export const checkForMaschineUNKNOWN = async (
  _bearerToken: string,
  _nationalStoreNumber: string,
  _location: Locations,
) => ({
  hasMilchshake: Availability.UNKNOWN,
  hasMcSundae: Availability.UNKNOWN,
  hasMcFlurry: Availability.UNKNOWN,
  status: 'UNKNOWN',
});
