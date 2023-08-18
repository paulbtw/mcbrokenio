import { APIType, IceType, ICountryInfos, Locations } from '../types';

export const CountryInfos: Record<Locations, ICountryInfos> = {
  // EU-PROD API
  [Locations.DE]: {
    country: Locations.DE,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5000', '5010', '5020'],
      [IceType.MCFLURRY]: ['4237', '4252', '4255', '4256', '4258'],
      [IceType.MCSUNDAE]: ['4603', '4604', '4651'],
    },
    locationLimits: {
      minLatitude: 47.270111,
      maxLatitude: 55.05814,
      minLongitude: 5.866315,
      maxLongitude: 15.041896,
    },
  },
  [Locations.NL]: {
    // Has no mobile ordering
    country: Locations.NL,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
    locationLimits: {
      minLatitude: 51.278,
      maxLatitude: 53.554,
      minLongitude: 3.021,
      maxLongitude: 7.227,
    },
  },
  [Locations.UK]: {
    country: Locations.UK,
    getStores: {
      api: APIType.EU,
      url: 'https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4300', '4310', '4330', '4320'],
      [IceType.MCFLURRY]: ['4467', '4694', '4397', '6554'],
      [IceType.MCSUNDAE]: ['UNAVAILABLE'],
    },
    locationLimits: {
      minLatitude: 49.674,
      maxLatitude: 59.454,
      minLongitude: -8.649,
      maxLongitude: 1.763,
    },
  },
  // EL-PROD API
  [Locations.AT]: {
    country: Locations.AT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/at/en-en',
      mobileString: 'Mobil bestellen und bezahlen',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5020', '5030', '5010'],
      [IceType.MCFLURRY]: ['4238', '4214', '4181', '4778'],
      [IceType.MCSUNDAE]: ['5076', '4010', '4020', '4030', '4040'],
    },
  },
  [Locations.BH]: {
    // Has no mobile ordering
    country: Locations.BH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/bh/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.BY]: {
    // Has no mobile ordering
    country: Locations.BY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/by/ru-ru',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.BE]: {
    // Has no mobile ordering
    country: Locations.BE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/be/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.BA]: {
    // Has no mobile ordering
    country: Locations.BA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ba/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.BG]: {
    // Has no mobile ordering
    country: Locations.BG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/bg/bg-bg',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.HR]: {
    // Has no mobile ordering
    country: Locations.HR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hr/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.CY]: {
    country: Locations.CY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/cy/en-en',
      mobileString: 'Mobile order and pay',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['3920', '3980', '4040', '4071'],
      [IceType.MCFLURRY]: [
        '2606',
        '2610',
        '2620',
        '2646',
        '2660',
        '2670',
        '2680',
        '2690',
      ],
      [IceType.MCSUNDAE]: ['2550', '2560', '2570', '2580'],
    },
  },
  [Locations.CZ]: {
    // Has no mobile ordering
    country: Locations.CZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/cz/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.DK]: {
    country: Locations.DK,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/dk/da-dk',
      mobileString: 'Mobilbestilling',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1802', '1801', '1803'],
      [IceType.MCFLURRY]: ['2106', '2107', '8025', '8946', '8366'],
      [IceType.MCSUNDAE]: ['2104', '2102', '2103'],
    },
  },
  [Locations.EG]: {
    // Has no mobile ordering
    country: Locations.EG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/eg/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.SV]: {
    // Has no mobile ordering
    country: Locations.SV,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sv/es-sv',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.EE]: {
    country: Locations.EE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ee/en-gb',
      mobileString: 'Mobile order and pay',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4704', '4706', '4705'],
      [IceType.MCFLURRY]: ['4493', '4462', '4458'],
      [IceType.MCSUNDAE]: ['4346', '4347', '4348'],
    },
  },
  [Locations.FI]: {
    country: Locations.FI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/fi/fi-fi',
      mobileString: 'Mobiilitilaus ja maksu',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5311', '5301', '5321'],
      [IceType.MCFLURRY]: ['5430', '5436', '5450'],
      [IceType.MCSUNDAE]: ['5200', '5210', '5220', '5230'],
    },
  },
  [Locations.FR]: {
    // TODO not working
    country: Locations.FR,
    getStores: {
      api: APIType.UNKNOWN,
      url: '',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.GE]: {
    // Has no mobile ordering
    country: Locations.GE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ge/ka-ge',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.GR]: {
    // Has no mobile ordering
    country: Locations.GR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/gr/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.GT]: {
    // Has no mobile ordering
    country: Locations.GT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/gt/es-gt',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.HN]: {
    // Has no mobile ordering
    country: Locations.HN,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hn/es-hn',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.HU]: {
    // Has no mobile ordering
    country: Locations.HU,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hu/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.ID]: {
    // Has no mobile ordering
    country: Locations.ID,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/id/id-id',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.IE]: {
    // Has no mobile ordering
    country: Locations.IE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ie/en-ie',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.IT]: {
    country: Locations.IT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/it/it-it',
      mobileString: 'Ordina e paga dal cellulare',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4308', '4310', '4311', '4353'],
      [IceType.MCFLURRY]: ['4029', '4040', '4039', '3030', '4032'],
      [IceType.MCSUNDAE]: ['4026', '4101', '4140', '4324', '4120', '4033'],
    },
  },
  [Locations.JO]: {
    // Has no mobile ordering
    country: Locations.JO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/jo/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.KZ]: {
    // Has no mobile ordering
    country: Locations.KZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kz/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.KW]: {
    // Has no mobile ordering
    country: Locations.KW,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kw/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.LV]: {
    // Has no mobile ordering
    country: Locations.LV,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lv/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.LB]: {
    // Has no mobile ordering
    country: Locations.LB,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lb/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.LT]: {
    // Has no mobile ordering
    country: Locations.LT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lt/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.MY]: {
    country: Locations.MY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/my/en-gb',
      mobileString: 'Mobile order and pay',
    },
    productCodes: {
      // ADD MORE HERE
      [IceType.MILCHSHAKE]: ['4022'],
      [IceType.MCFLURRY]: ['9008192', '9008150', '8114'],
      [IceType.MCSUNDAE]: ['4000', '4001'],
    },
  },
  [Locations.MT]: {
    // Has no mobile ordering
    country: Locations.MT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/mt/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.MU]: {
    // Has no mobile ordering
    country: Locations.MU,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/mu/en-mu',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.MA]: {
    // Has no mobile ordering
    country: Locations.MA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ma/fr-ma',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.NZ]: {
    // Has no mobile ordering
    country: Locations.NZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/nz/en-en',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.NI]: {
    // Has no mobile ordering
    country: Locations.NI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ni/es-ni',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.NO]: {
    country: Locations.NO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/no/nb-no',
      mobileString: 'Mobil bestilling og betaling',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['2212', '2222', '2232', '6686'],
      [IceType.MCFLURRY]: ['3210', '3211', '3212', '3214', '6605'],
      [IceType.MCSUNDAE]: ['3110', '3111', '3112', '6698', '6699', '6700'],
    },
  },
  [Locations.PK]: {
    // Has no mobile ordering
    country: Locations.PK,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pk/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.PY]: {
    // Has no mobile ordering
    country: Locations.PY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/py/es-py',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.PL]: {
    country: Locations.PL,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pl/pl-pl',
      mobileString: 'Zamów i odbierz',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4365', '4070', '4010', '4040'],
      [IceType.MCFLURRY]: [
        '9884',
        '9824',
        '9826',
        '9828',
        '9875',
        '9825',
        '9827',
        '9829',
        '9876',
        '2727',
        '3300',
        '3303',
        '3302',
        '3318',
        '3309',
        '3308',
        '3310',
      ],
      [IceType.MCSUNDAE]: [
        '9885',
        '9886',
        '9836',
        '9837',
        '9838',
        '3083',
        '3082',
        '3084',
      ],
    },
  },
  [Locations.PT]: {
    country: Locations.PT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pt/pt-pt',
      mobileString: 'Pedidos Mobile',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: [
        '8643',
        '5099',
        '5200',
        '5174',
        '242',
        '5100',
        '5201',
        '5175',
      ],
      [IceType.MCSUNDAE]: ['4030', '4020', '4010'],
    },
  },
  [Locations.RE]: {
    // Has no mobile ordering
    country: Locations.RE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/re/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.RO]: {
    // Has no mobile ordering
    country: Locations.RO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ro/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.RS]: {
    // Has no mobile ordering
    country: Locations.RS,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/rs/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.SG]: {
    country: Locations.SG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sg/en-gb',
      mobileString: 'Mobile order and pay',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: ['504121', '505327', '505341', '505342'],
      [IceType.MCSUNDAE]: ['505325', '505326'],
    },
  },
  [Locations.SI]: {
    // Has no mobile ordering
    country: Locations.SI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/si/sl-si',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.SAR]: {
    // Has no mobile ordering
    country: Locations.SAR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sar/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.KR]: {
    // Has no mobile ordering
    country: Locations.KR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kr/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.ES]: {
    country: Locations.ES,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/es/es-es',
      mobileString: 'Pedido móvil para recoger en restaurante',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: [
        '4579',
        '4580',
        '4543',
        '1887',
        '1283',
        '1279',
        '1277',
        '1278',
        '9317',
        '1282',
        '1280',
        '1281',
        '9316',
        '1276',
        '1274',
        '1275',
        '9315',
      ],
      [IceType.MCSUNDAE]: ['1200', '1190', '1195', '1180'],
    },
  },
  [Locations.SE]: {
    country: Locations.SE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/se/sv-se',
      mobileString: 'Mobil beställning och betalning',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4053', '4600', '4500', '4700'],
      [IceType.MCFLURRY]: ['5289', '5260', '5319'],
      [IceType.MCSUNDAE]: ['5200', '5210', '5220', '5240'],
    },
  },
  [Locations.CH]: {
    country: Locations.CH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ch/de-ch',
      mobileString: 'Mobil bestellen und bezahlen',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5396', '568', '478'],
      [IceType.MCFLURRY]: ['611', '663', '3276'],
      [IceType.MCSUNDAE]: ['438', '439', '3282', '5400'],
    },
  },
  [Locations.TH]: {
    // Has no mobile ordering
    country: Locations.TH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/th/th-th',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.AE]: {
    country: Locations.AE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ae/en-gb',
      mobileString: 'Mobile order and pay',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: ['1221', '1222'],
      [IceType.MCSUNDAE]: ['1201', '1202', '1203'],
    },
  },
  [Locations.UA]: {
    // Has no mobile ordering
    country: Locations.UA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ua/uk-ua',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
  [Locations.VN]: {
    // Has no mobile ordering
    country: Locations.VN,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/vn/vi-vn',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },

  // US-PROD API
  // Only works with USA IP
  [Locations.CA]: {
    country: Locations.CA,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1125', '1126', '1127', '16813'],
      [IceType.MCFLURRY]: ['16804', '16763', '5229', '11678'],
      [IceType.MCSUNDAE]: ['132', '133'],
    },
    locationLimits: {
      minLatitude: 41.676,
      maxLatitude: 69.529,
      minLongitude: -141.001,
      maxLongitude: -52.617,
    },
  },
  [Locations.US]: {
    country: Locations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478'],
    },
    locationLimits: {
      minLatitude: 24.9493,
      maxLatitude: 37.9493,
      minLongitude: -124.733,
      maxLongitude: -66.9499,
    },
  },
  [Locations.US2]: {
    country: Locations.US,
    getStores: {
      api: APIType.US,
      url: 'https://us-prod.api.mcd.com/exp/v1/restaurant/location?distance=100000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1598', '1509', '1513'],
      [IceType.MCFLURRY]: ['557', '3830', '3832'],
      [IceType.MCSUNDAE]: ['345', '337', '478'],
    },
    locationLimits: {
      minLatitude: 37.9493,
      maxLatitude: 49.5904,
      minLongitude: -124.733,
      maxLongitude: -66.9499,
    },
  },

  // AP-PROD API
  [Locations.AU]: {
    country: Locations.AU,
    getStores: {
      api: APIType.AP,
      url: 'https://ap-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1502', '1512', '1522'],
      [IceType.MCFLURRY]: ['5739', '5738'],
      [IceType.MCSUNDAE]: ['30001', '30002', '30003', '30004'],
    },
    locationLimits: {
      minLatitude: -43.003,
      maxLatitude: -10.8752,
      minLongitude: 112.911,
      maxLongitude: 153.6388,
    },
  },
  [Locations.AU2]: {
    country: Locations.AU,
    getStores: {
      api: APIType.AP,
      url: 'https://ap-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=250&',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1502', '1512', '1522'],
      [IceType.MCFLURRY]: ['5739', '5738'],
      [IceType.MCSUNDAE]: ['30001', '30002', '30003', '30004'],
    },
    locationLimits: {
      minLatitude: -35.0,
      maxLatitude: -10.8752,
      minLongitude: 112.911,
      maxLongitude: 129.7749,
    },
  },

  // AP API
  [Locations.HK]: {
    country: Locations.HK,
    getStores: {
      api: APIType.HK,
      url: 'https://ap.api.mcd.com/v3/restaurant/location?filter=search&query=%7B%22market%22%3A%22HK%22,%22storeAttributes%22%3A%5B%5D,%22pageSize%22%3A500,%22local%22%3A%22en-HK%22,%22locationCriteria%22%3A%7B%22distance%22%3A%225000%22,%22longitude%22%3A%22114.108436%22,%22latitude%22%3A%2222.352316%22%7D%7D',
      mobileString: 'MOBILEORDERS',
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4325', '4326', '4320'],
      [IceType.MCFLURRY]: ['22794', '1528'],
      [IceType.MCSUNDAE]: ['4448', '4449'],
    },
  },

  // Unknown API location
  [Locations.UNKNOWN]: {
    country: Locations.UNKNOWN,
    getStores: {
      api: APIType.UNKNOWN,
      url: '',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: [],
    },
  },
};
