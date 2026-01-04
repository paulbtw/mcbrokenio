/* eslint-disable @typescript-eslint/no-restricted-imports */
import { baseServerlessConfiguration } from '@mcbroken/serverless-config'
import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcau',

  provider: {
    ...baseServerlessConfiguration.provider!,
    region: 'ap-southeast-2',
    deploymentBucket: { name: "mcbrokenio-mcau-bucket-dev" }
  },

  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/getAllStores/index.handler',
      events: [
        {
          schedule: {
            rate: ['cron(05 1 ? * SUN *)'],
            input: { countries: ['AU2'] }
          }
        },
        {
          schedule: {
            rate: ['cron(05 2 ? * SUN *)'],
            input: { countries: ['AU'] }
          }
        }
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        BASIC_TOKEN_AP: '${env:BASIC_TOKEN_AP}'
      }
    },
    getItemStatus: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/getItemStatus/index.handler',
      events: [
        {
          schedule: 'cron(0 * * * ? *)'
        }
      ],
      environment: {
        BASIC_TOKEN_AP: '${env:BASIC_TOKEN_AP}',
        DATABASE_URL: '${env:DATABASE_URL}'
      }
    }
  }
}

module.exports = serverlessConfiguration

