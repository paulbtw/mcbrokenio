/* eslint-disable @typescript-eslint/no-restricted-imports */
import type { AWS } from '@serverless/typescript'
import { baseServerlessConfiguration } from './serverless.base'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcus',

  provider: {
    ...baseServerlessConfiguration.provider,
    name: 'aws',
    region: 'us-east-2',
    deploymentBucket: { name: "mcbrokenio-mcus-bucket-${opt:stage, 'dev'}" },
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
      handler: 'src/stacks/mcus/getAllStores.handler',
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
      handler: 'src/stacks/mcus/getItemStatus.handler',
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
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    }
  }
}

module.exports = serverlessConfiguration
