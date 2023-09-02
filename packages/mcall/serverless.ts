import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'eu-central-1',
    deploymentBucket: { name: "mcbrokenio-mcall-bucket-${opt:stage, 'dev'}" },
  },

  service: 'mcall',
  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/getAllStores.getAllStores',
      events: [
        {
          schedule: 'cron(06 * ? * * *)',
        },
      ],
      environment: {
        BASIC_TOKEN_EU: '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: '${env:DATABASE_URL}',
        KEY: '${env:KEY}',
      },
    },
    getItemStatus: {
      memorySize: 368,
      timeout: 600,
      handler: 'src/getItemStatus.handler',
      events: [
        {
          schedule: 'cron(08 * ? * * *)',
        },
      ],
      environment: {
        BASIC_TOKEN_EU: '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: '${env:DATABASE_URL}',
        KEY: '${env:KEY}',
      },
    },
    getLocation: {
      handler: 'src/getLocation.handler',
      memorySize: 128,
      timeout: 5,
      events: [
        {
          http: {
            method: 'get',
            path: '/',
            cors: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
