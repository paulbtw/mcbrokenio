import { type ICountryInfos, APIType, IceType, ElLocations } from '@libs/types'

export const El: Record<ElLocations, ICountryInfos> = {
  // EL-PROD API
  [ElLocations.AT]: {
    country: ElLocations.AT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/at/en-en',
      mobileString: 'Mobil bestellen und bezahlen'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5020', '5030', '5010'],
      [IceType.MCFLURRY]: ['4238', '4214', '4181', '4778'],
      [IceType.MCSUNDAE]: ['5076', '4010', '4020', '4030', '4040']
    }
  },
  [ElLocations.BH]: {
    // Has no mobile ordering
    country: ElLocations.BH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/bh/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.BY]: {
    // Has no mobile ordering
    country: ElLocations.BY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/by/ru-ru'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.BE]: {
    // Has no mobile ordering
    country: ElLocations.BE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/be/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.BA]: {
    // Has no mobile ordering
    country: ElLocations.BA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ba/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.BG]: {
    // Has no mobile ordering
    country: ElLocations.BG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/bg/bg-bg'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.HR]: {
    // Has no mobile ordering
    country: ElLocations.HR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hr/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.CY]: {
    country: ElLocations.CY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/cy/en-en',
      mobileString: 'Mobile order and pay'
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
        '2690'
      ],
      [IceType.MCSUNDAE]: ['2550', '2560', '2570', '2580']
    }
  },
  [ElLocations.CZ]: {
    // Has no mobile ordering
    country: ElLocations.CZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/cz/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.DK]: {
    country: ElLocations.DK,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/dk/da-dk',
      mobileString: 'Mobilbestilling'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['1802', '1801', '1803'],
      [IceType.MCFLURRY]: ['2106', '2107', '8025', '8946', '8366'],
      [IceType.MCSUNDAE]: ['2104', '2102', '2103']
    }
  },
  [ElLocations.EG]: {
    // Has no mobile ordering
    country: ElLocations.EG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/eg/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.SV]: {
    // Has no mobile ordering
    country: ElLocations.SV,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sv/es-sv'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.EE]: {
    country: ElLocations.EE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ee/en-gb',
      mobileString: 'Mobile order and pay'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4704', '4706', '4705'],
      [IceType.MCFLURRY]: ['4493', '4462', '4458'],
      [IceType.MCSUNDAE]: ['4346', '4347', '4348']
    }
  },
  [ElLocations.FI]: {
    country: ElLocations.FI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/fi/fi-fi',
      mobileString: 'Mobiilitilaus ja maksu'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5311', '5301', '5321'],
      [IceType.MCFLURRY]: ['5430', '5436', '5450'],
      [IceType.MCSUNDAE]: ['5200', '5210', '5220', '5230']
    }
  },
  [ElLocations.FR]: {
    // TODO not working
    country: ElLocations.FR,
    getStores: {
      api: APIType.UNKNOWN,
      url: ''
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.GE]: {
    // Has no mobile ordering
    country: ElLocations.GE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ge/ka-ge'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.GR]: {
    // Has no mobile ordering
    country: ElLocations.GR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/gr/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.GT]: {
    // Has no mobile ordering
    country: ElLocations.GT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/gt/es-gt'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.HN]: {
    // Has no mobile ordering
    country: ElLocations.HN,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hn/es-hn'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.HU]: {
    // Has no mobile ordering
    country: ElLocations.HU,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/hu/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.ID]: {
    // Has no mobile ordering
    country: ElLocations.ID,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/id/id-id'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.IE]: {
    // Has no mobile ordering
    country: ElLocations.IE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ie/en-ie'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.IT]: {
    country: ElLocations.IT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/it/it-it',
      mobileString: 'Ordina e paga dal cellulare'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4308', '4310', '4311', '4353'],
      [IceType.MCFLURRY]: ['4029', '4040', '4039', '3030', '4032'],
      [IceType.MCSUNDAE]: ['4026', '4101', '4140', '4324', '4120', '4033']
    }
  },
  [ElLocations.JO]: {
    // Has no mobile ordering
    country: ElLocations.JO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/jo/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.KZ]: {
    // Has no mobile ordering
    country: ElLocations.KZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kz/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.KW]: {
    // Has no mobile ordering
    country: ElLocations.KW,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kw/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.LV]: {
    // Has no mobile ordering
    country: ElLocations.LV,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lv/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.LB]: {
    // Has no mobile ordering
    country: ElLocations.LB,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lb/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.LT]: {
    // Has no mobile ordering
    country: ElLocations.LT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/lt/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.MY]: {
    country: ElLocations.MY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/my/en-gb',
      mobileString: 'Mobile order and pay'
    },
    productCodes: {
      // ADD MORE HERE
      [IceType.MILCHSHAKE]: ['4022'],
      [IceType.MCFLURRY]: ['9008192', '9008150', '8114'],
      [IceType.MCSUNDAE]: ['4000', '4001']
    }
  },
  [ElLocations.MT]: {
    // Has no mobile ordering
    country: ElLocations.MT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/mt/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.MU]: {
    // Has no mobile ordering
    country: ElLocations.MU,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/mu/en-mu'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.MA]: {
    // Has no mobile ordering
    country: ElLocations.MA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ma/fr-ma'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.NZ]: {
    // Has no mobile ordering
    country: ElLocations.NZ,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/nz/en-en'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.NI]: {
    // Has no mobile ordering
    country: ElLocations.NI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ni/es-ni'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.NO]: {
    country: ElLocations.NO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/no/nb-no',
      mobileString: 'Mobil bestilling og betaling'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['2212', '2222', '2232', '6686'],
      [IceType.MCFLURRY]: ['3210', '3211', '3212', '3214', '6605'],
      [IceType.MCSUNDAE]: ['3110', '3111', '3112', '6698', '6699', '6700']
    }
  },
  [ElLocations.PK]: {
    // Has no mobile ordering
    country: ElLocations.PK,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pk/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.PY]: {
    // Has no mobile ordering
    country: ElLocations.PY,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/py/es-py'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.PL]: {
    country: ElLocations.PL,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pl/pl-pl',
      mobileString: 'Zamów i odbierz'
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
        '3310'
      ],
      [IceType.MCSUNDAE]: [
        '9885',
        '9886',
        '9836',
        '9837',
        '9838',
        '3083',
        '3082',
        '3084'
      ]
    }
  },
  [ElLocations.PT]: {
    country: ElLocations.PT,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/pt/pt-pt',
      mobileString: 'Pedidos Mobile'
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
        '5175'
      ],
      [IceType.MCSUNDAE]: ['4030', '4020', '4010']
    }
  },
  [ElLocations.RE]: {
    // Has no mobile ordering
    country: ElLocations.RE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/re/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.RO]: {
    // Has no mobile ordering
    country: ElLocations.RO,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ro/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.RS]: {
    // Has no mobile ordering
    country: ElLocations.RS,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/rs/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.SG]: {
    country: ElLocations.SG,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sg/en-gb',
      mobileString: 'Mobile order and pay'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: ['504121', '505327', '505341', '505342'],
      [IceType.MCSUNDAE]: ['505325', '505326']
    }
  },
  [ElLocations.SI]: {
    // Has no mobile ordering
    country: ElLocations.SI,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/si/sl-si'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.SAR]: {
    // Has no mobile ordering
    country: ElLocations.SAR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/sar/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.KR]: {
    // Has no mobile ordering
    country: ElLocations.KR,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/kr/en-gb'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.ES]: {
    country: ElLocations.ES,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/es/es-es',
      mobileString: 'Pedido móvil para recoger en restaurante'
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
        '9315'
      ],
      [IceType.MCSUNDAE]: ['1200', '1190', '1195', '1180']
    }
  },
  [ElLocations.SE]: {
    country: ElLocations.SE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/se/sv-se',
      mobileString: 'Mobil beställning och betalning'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['4053', '4600', '4500', '4700'],
      [IceType.MCFLURRY]: ['5289', '5260', '5319'],
      [IceType.MCSUNDAE]: ['5200', '5210', '5220', '5240']
    }
  },
  [ElLocations.CH]: {
    country: ElLocations.CH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ch/de-ch',
      mobileString: 'Mobil bestellen und bezahlen'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['5396', '568', '478'],
      [IceType.MCFLURRY]: ['611', '663', '3276'],
      [IceType.MCSUNDAE]: ['438', '439', '3282', '5400']
    }
  },
  [ElLocations.TH]: {
    // Has no mobile ordering
    country: ElLocations.TH,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/th/th-th'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.AE]: {
    country: ElLocations.AE,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ae/en-gb',
      mobileString: 'Mobile order and pay'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: ['UNAVAILABLE'],
      [IceType.MCFLURRY]: ['1221', '1222'],
      [IceType.MCSUNDAE]: ['1201', '1202', '1203']
    }
  },
  [ElLocations.UA]: {
    // Has no mobile ordering
    country: ElLocations.UA,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/ua/uk-ua'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  },
  [ElLocations.VN]: {
    // Has no mobile ordering
    country: ElLocations.VN,
    getStores: {
      api: APIType.EL,
      url: 'https://api.me2-prd.gmal.app/api/locationfinder/v1/restaurants/vn/vi-vn'
    },
    productCodes: {
      [IceType.MILCHSHAKE]: [],
      [IceType.MCFLURRY]: [],
      [IceType.MCSUNDAE]: []
    }
  }
}
