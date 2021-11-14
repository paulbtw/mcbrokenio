import { ILocation, Locations } from '../types';

const locationsDE: ILocation[] = [
  { latitude: 53.750266, longitude: 9.997509 },
  { latitude: 53.492844, longitude: 12.863308 },
  { latitude: 53.113355, longitude: 8.301708 },
  { latitude: 51.860757, longitude: 8.131766 },
  { latitude: 52.327831, longitude: 10.403621 },
  { latitude: 52.300492, longitude: 12.916973 },
  { latitude: 51.265823, longitude: 13.238969 },
  { latitude: 50.883682, longitude: 10.770338 },
  { latitude: 50.435755, longitude: 7.818715 },
  { latitude: 51.075147, longitude: 6.468124 },
  { latitude: 49.758726, longitude: 8.605815 },
  { latitude: 49.787608, longitude: 11.047612 },
  { latitude: 48.890135, longitude: 12.111985 },
  { latitude: 48.695687, longitude: 9.205083 },
  { latitude: 47.603687, longitude: 10.850837 },
  { latitude: 49.358397, longitude: 6.691731 },
];

const locationsNL: ILocation[] = [
  { latitude: 52.681406, longitude: 6.19748 },
  { latitude: 51.688853, longitude: 4.876943 },
];

const locationsDK: ILocation[] = [{ latitude: 55.870697, longitude: 9.755915 }];

const locationsSE: ILocation[] = [
  { latitude: 64.295415, longitude: 15.746083 },
];

const locationsFI: ILocation[] = [{ latitude: 62.67328, longitude: 27.61612 }];

const locationsIE: ILocation[] = [
  { latitude: 52.920847, longitude: -7.852518 },
];

const locationsGB: ILocation[] = [
  { latitude: 57.994378, longitude: -3.972565 },
  { latitude: 56.779153, longitude: -4.077448 },
  { latitude: 55.90728, longitude: -3.762799 },
  { latitude: 55.001332, longitude: -1.727731 },
  { latitude: 53.704428, longitude: -1.290566 },
  { latitude: 53.350065, longitude: -2.482832 },
  { latitude: 52.5761, longitude: -1.211082 },
  { latitude: 51.697997, longitude: -4.072521 },
  { latitude: 52.212327, longitude: 0.020926 },
  { latitude: 51.697997, longitude: -0.999123 },
  { latitude: 51.310441, longitude: 0.232885 },
  { latitude: 50.743876, longitude: -3.15845 },
];

const locationsNO: ILocation[] = [
  { latitude: 61.17083, longitude: 8.446994 },
  { latitude: 65.915455, longitude: 13.309582 },
  { latitude: 69.872039, longitude: 21.878619 },
];

export const getAllLocation: Record<Locations, ILocation[]> = {
  [Locations.DE]: locationsDE,
  [Locations.NL]: locationsNL,
  [Locations.DK]: locationsDK,
  [Locations.SE]: locationsSE,
  [Locations.FI]: locationsFI,
  [Locations.IE]: locationsIE,
  [Locations.GB]: locationsGB,
  [Locations.NO]: locationsNO,
};
