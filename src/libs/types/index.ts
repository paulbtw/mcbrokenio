import { type Prisma } from '@prisma/client'

export enum Locations {
  AE = 'AE', // United Arab Emirates
  AT = 'AT', // Austria
  AU = 'AU', // Australia
  AU2 = 'AU2', // Australia
  BA = 'BA', // Bosnia and Herzegovina
  BE = 'BE', // Belgium
  BG = 'BG', // Bulgaria
  BH = 'BH', // Bahrain
  BY = 'BY', // Belarus
  CA = 'CA', // Canada
  CY = 'CY', // Cyprus
  CZ = 'CZ', // Czech Republic
  CH = 'CH', // Switzerland
  DE = 'DE', // Germany
  DK = 'DK', // Denmark
  EE = 'EE', // Estonia
  EG = 'EG', // Egypt
  ES = 'ES', // Spain
  FI = 'FI', // Finland
  FR = 'FR', // United Kingdom
  GE = 'GE', // Georgia
  GR = 'GR', // Greece
  GT = 'GT', // Guatemala
  HK = 'HK', // Hong Kong
  HN = 'HN', // Honduras
  HR = 'HR', // Croatia
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
  MA = 'MA', // Morocco
  MT = 'MT', // Malta
  MU = 'MU', // Mauritius
  MY = 'MY', // Malaysia
  NI = 'NI', // Nicaragua
  NL = 'NL', // Netherlands
  NO = 'NO', // Norway
  NZ = 'NZ', // New Zealand
  PK = 'PK', // Pakistan
  PL = 'PL', // Poland
  PT = 'PT', // Portugal
  PY = 'PY', // Paraguay
  RE = 'RE', // Reunion
  RO = 'RO', // Romania
  RS = 'RS', // Serbia
  SG = 'SG', // Singapore
  SAR = 'SAR', // Saudi Arabia
  KR = 'KR', // South Korea
  SE = 'SE', // Sweden
  SI = 'SI', // Slovenia
  SV = 'SV', // El Salvador
  TH = 'TH', // Thailand
  UA = 'UA', // Ukraine
  UK = 'UK', // United Kingdom
  UNKNOWN = 'UNKNOWN',
  US = 'US', // United States
  US2 = 'US2', // United States
  VN = 'VN', // Vietnam
}

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
