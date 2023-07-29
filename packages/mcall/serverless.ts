import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'eu-central-1'
  },
  service: 'mcall',
  functions: {
    hello: {
      handler: 'src/handler.hello',
      events: [
        {
          schedule: 'rate(1 minute)'
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
