import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'eu-central-1',
  },

  service: 'mcall',
  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/handler.getAllStores',
      events: [
        {
          schedule: 'rate(1 minute)',
        },
      ],
      environment: {
        BASIC_TOKEN_EU: '${env:BASIC_TOKEN_EU}',
      },
    },
  },
};

module.exports = serverlessConfiguration;
