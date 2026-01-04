import { type Prisma } from '@mcbroken/db'

export enum ApLocations {
  AU = 'AU', // Australia
  AU2 = 'AU2', // Australia
  HK = 'HK', // Hong Kong
}

export enum ElLocations {
  AT = 'AT', // Austria
  BH = 'BH', // Bahrain
  BY = 'BY', // Belarus
  BE = 'BE', // Belgium
  BA = 'BA', // Bosnia and Herzegovina
  BG = 'BG', // Bulgaria
  HR = 'HR', // Croatia
  CY = 'CY', // Cyprus
  CZ = 'CZ', // Czech Republic
  DK = 'DK', // Denmark
  EG = 'EG', // Egypt
  SV = 'SV', // El Salvador
  EE = 'EE', // Estonia
  FI = 'FI', // Finland
  FR = 'FR', // France
  GE = 'GE', // Georgia
  GR = 'GR', // Greece
  GT = 'GT', // Guatemala
  HN = 'HN', // Honduras
  HU = 'HU', // Hungary
  ID = 'ID', // Indonesia
  IE = 'IE', // Ireland
  IT = 'IT', // Italy
  JO = 'JO', // Jordan
  KZ = 'KZ', // Kazakhstan
  KW = 'KW', // Kuwait
  LV = 'LV', // Latvia
  LB = 'LB', // Lebanon
  LT = 'LT', // Lithuania
  MY = 'MY', // Malaysia
  MT = 'MT', // Malta
  MU = 'MU', // Mauritius
  MA = 'MA', // Morocco
  NZ = 'NZ', // New Zealand
  NI = 'NI', // Nicaragua
  NO = 'NO', // Norway
  PK = 'PK', // Pakistan
  PY = 'PY', // Paraguay
  PL = 'PL', // Poland
  PT = 'PT', // Portugal
  RE = 'RE', // Reunion
  RO = 'RO', // Romania
  RS = 'RS', // Serbia
  SG = 'SG', // Singapore
  SI = 'SI', // Slovenia
  SAR = 'SAR', // Saudi Arabia
  KR = 'KR', // South Korea
  ES = 'ES', // Spain
  SE = 'SE', // Sweden
  CH = 'CH', // Switzerland
  TH = 'TH', // Thailand
  AE = 'AE', // United Arab Emirates
  UA = 'UA', // Ukraine
  VN = 'VN', // Vietnam
}

export enum UsLocations {
  CA = 'CA', // Canada
  US = 'US', // United States
  US2 = 'US2', // United States
  US3 = 'US3', // United States
  US4 = 'US4', // United States
  US5 = 'US5', // United States Alaska
  US6 = 'US6', // United States Hawaii
}

export enum EuLocations {
  DE = 'DE', // Germany
  NL = 'NL', // Netherlands
  UK = 'UK', // United Kingdom
}

export enum UnknownLocations {
  UNKNOWN = 'UNKNOWN',
}

export type Locations = ApLocations | ElLocations | UsLocations | EuLocations | UnknownLocations

export interface ILocation {
  latitude: number
  longitude: number
}

export interface LocationLimits {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

export enum APIType {
  AP = 'AP',
  EL = 'EL',
  EU = 'EU',
  HK = 'HK',
  UNKNOWN = 'UNKNOWN',
  US = 'US',
}

export enum IceType {
  MCFLURRY = 'MCFLURRY',
  MCSUNDAE = 'MCSUNDAE',
  MILCHSHAKE = 'MILCHSHAKE',
}

export interface ICountryInfos {
  country: Locations
  getStores: {
    api: APIType
    mobileString?: string
    url: string
  }
  productCodes: Record<IceType, string[]>
  customItems?: Record<string, string[]>
  locationLimits?: LocationLimits
}

export type CreatePos = Prisma.PosCreateInput
export type UpdatePos = Prisma.PosUpdateInput
