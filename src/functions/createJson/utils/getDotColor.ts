import { Availability } from '../../../types';

export const getColorDot = (
  hasMcFlurry: Availability,
  hasMcSundae: Availability,
  hasMilchshake: Availability,
) => {
  if (
    hasMcFlurry === Availability.UNKNOWN &&
    hasMcSundae === Availability.UNKNOWN &&
    hasMilchshake === Availability.UNKNOWN
  ) {
    return 'GREY';
  }
  if (
    hasMcFlurry === Availability.AVAILABLE &&
    hasMcSundae === Availability.AVAILABLE &&
    hasMilchshake === Availability.AVAILABLE
  ) {
    return 'GREEN';
  }
  if (
    hasMcFlurry === Availability.NOT_AVAILABLE &&
    hasMcSundae === Availability.NOT_AVAILABLE &&
    hasMilchshake === Availability.NOT_AVAILABLE
  ) {
    return 'RED';
  }

  return 'YELLOW';
};
