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
    [Availability.AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMcFlurry,
    ) &&
    [Availability.AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMcSundae,
    ) &&
    [Availability.AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMilchshake,
    )
  ) {
    return 'GREEN';
  }
  if (
    [Availability.NOT_AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMcFlurry,
    ) &&
    [Availability.NOT_AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMcSundae,
    ) &&
    [Availability.NOT_AVAILABLE, Availability.NOT_APPLICABLE].includes(
      hasMilchshake,
    )
  ) {
    return 'RED';
  }

  return 'YELLOW';
};
