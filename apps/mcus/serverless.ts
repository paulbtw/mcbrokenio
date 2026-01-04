/* eslint-disable @typescript-eslint/no-restricted-imports */
import { baseServerlessConfiguration } from '@mcbroken/serverless-config'
import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcus',

  provider: {
    ...baseServerlessConfiguration.provider!,
    region: 'us-east-2',
    deploymentBucket: { name: "mcbrokenio-mcus-bucket-dev" },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject', 's3:PutObjectAcl', 's3:GetObject'],
            Resource: ['arn:aws:s3:::*']
          }
        ]
      }
    }
  },

  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/getAllStores/index.handler',
      events: [
        {
          schedule: {
            rate: ['cron(35 0 ? * SUN *)'],
            input: { countries: ['US'] }
          }
        },
        {
          schedule: {
            rate: ['cron(35 1 ? * SUN *)'],
            input: { countries: ['US2'] }
          }
        },
        {
          schedule: {
            rate: ['cron(35 2 ? * SUN *)'],
            input: { countries: ['US3'] }
          }
        },
        {
          schedule: {
            rate: ['cron(35 3 ? * SUN *)'],
            input: { countries: ['US4'] }
          }
        },
        {
          schedule: {
            rate: ['cron(35 4 ? * SUN *)'],
            input: { countries: ['US5'] }
          }
        },
        {
          schedule: {
            rate: ['cron(35 5 ? * SUN *)'],
            input: { countries: ['US6'] }
          }
        }
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        BASIC_TOKEN_US: '${env:BASIC_TOKEN_US}'
      }
    },
    getItemStatus: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/getItemStatus/index.handler',
      events: [
        {
          schedule: 'cron(0/30 * * * ? *)'
        }
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        BASIC_TOKEN_US: '${env:BASIC_TOKEN_US}'
      }
    }
  }
}

module.exports = serverlessConfiguration

