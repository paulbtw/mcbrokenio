import { ILocation, Locations } from '../../../types';

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

const locationsIE: ILocation[] = [
  { latitude: 52.920847, longitude: -7.852518 },
];

export const getAllLocation: Record<Locations, ILocation[]> = {
  [Locations.DE]: locationsDE,
  [Locations.NL]: locationsNL,
  [Locations.DK]: [],
  [Locations.SE]: [],
  [Locations.FI]: [],
  [Locations.IE]: locationsIE,
  [Locations.GB]: [],
  [Locations.NO]: [],
  [Locations.AT]: [],
  [Locations.CH]: [],
  [Locations.FR]: [],
  [Locations.IT]: [],
  [Locations.ES]: [],
  [Locations.US]: [],
  [Locations.CA]: [],
  [Locations.BE]: [],
  [Locations.VN]: [],
  [Locations.HR]: [],
  [Locations.GR]: [],
  [Locations.PT]: [],
  [Locations.BG]: [],
  [Locations.BA]: [],
  [Locations.BY]: [],
  [Locations.UNKNOWN]: [],
};
