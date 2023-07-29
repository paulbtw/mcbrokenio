import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'ap-southeast-2'
  },
  service: 'mcau',
  functions: {

  },
};

module.exports = serverlessConfiguration;
