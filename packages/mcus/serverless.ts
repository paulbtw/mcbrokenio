import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  service: 'mcus',
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'us-east-2',
    deploymentBucket: { name: "mcbrokenio-mcus-bucket-${opt:stage, 'dev'}" },
  },
  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/getAllStores.getAllStores',
      events: [
        {
          schedule: 'cron(39 * ? * * *)',
        },
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        BASIC_TOKEN_US: '${env:BASIC_TOKEN_US}',
      },
    },
  },
};

module.exports = serverlessConfiguration;
