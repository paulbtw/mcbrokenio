import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  service: 'mcus',
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'us-east-2'
  },
  functions: {

  },
};

module.exports = serverlessConfiguration;
