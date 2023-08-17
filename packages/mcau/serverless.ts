import { type Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  provider: {
    ...baseServerlessConfiguration.provider,
    region: 'ap-southeast-2',
    deploymentBucket: { name: "mcbrokenio-mcau-bucket-${opt:stage, 'dev'}" },
  },
  service: 'mcau',
  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/getAllStores.getAllStores',
      events: [
        {
          schedule: {
            rate: 'cron(20 * ? * * *)',
            input: {
              key: 'AU2',
            },
          },
        },
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        BASIC_TOKEN_AP: '${env:BASIC_TOKEN_AP}',
      },
    },
  },
};

module.exports = serverlessConfiguration;
