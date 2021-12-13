import { Availability } from '../../../types';

export const checkForMaschineUNKNOWN = async () => ({
  hasMilchshake: Availability.UNKNOWN,
  hasMcSundae: Availability.UNKNOWN,
  hasMcFlurry: Availability.UNKNOWN,
  status: 'UNKNOWN',
});
