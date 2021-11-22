import { APIType, IceType, ICountryInfos, Locations } from '../types';

export const CountryInfos: Record<Locations, ICountryInfos> = {
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
  [Locations.AT]: {
    // Has no mobile ordering
    country: Locations.AT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/at/de-at',
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
  [Locations.ES]: {
    // Has no mobile ordering
    country: Locations.ES,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/es/es-es',
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
  [Locations.DK]: {
    // TODO
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
  },
  [Locations.GB]: {
    // TODO
    country: Locations.GB,
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
  [Locations.FR]: {
    // TODO
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
  [Locations.US]: {
    // Only works with USA IP
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
  },
  [Locations.CA]: {
    // TODO
    country: Locations.CA,
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
      mobileString: null,
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
  [Locations.EE]: {
    country: Locations.EE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ee/en-gb',
      mobileString: null,
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4704', '4706', '4705'],
      [IceType.MCFLURRY]: ['4493', '4462', '4458'],
      [IceType.MCSUNDAE]: ['4346', '4347', '4348'],
    },
  },
  [Locations.AE]: {
    country: Locations.AE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ae/en-gb',
      mobileString: null,
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
