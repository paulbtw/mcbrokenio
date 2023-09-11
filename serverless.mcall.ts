/* eslint-disable @typescript-eslint/no-restricted-imports */
import type { AWS } from '@serverless/typescript'
import { baseServerlessConfiguration } from './serverless.base'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcall',

  provider: {
    ...baseServerlessConfiguration.provider,
    name: 'aws',
    region: 'eu-central-1',
    deploymentBucket: { name: "mcbrokenio-mcall-bucket-${opt:stage, 'dev'}" },
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
      handler: 'src/stacks/mcall/getAllStores.handler',
      events: [
        {
          schedule: 'cron(05 0 ? * SUN *)'
        }
      ],
      environment: {
        BASIC_TOKEN_EU: '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: '${env:DATABASE_URL}',
        KEY: '${env:KEY}'
      }
    },
    getItemStatus: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/stacks/mcall/getItemStatus.handler',
      events: [
        {
          schedule: 'cron(05 0 ? * SUN *)'
        }
      ],
      environment: {
        BASIC_TOKEN_EU: '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: '${env:DATABASE_URL}',
        KEY: '${env:KEY}'
      }
    },
    createJson: {
      memorySize: 368,
      timeout: 60,
      handler: 'src/stacks/mcall/createJson.handler',
      events: [
        {
          schedule: 'cron(05 0 ? * SUN *)'
        }
      ],
      environment: {
        DATABASE_URL: '${env:DATABASE_URL}',
        EXPORT_BUCKET: '${env:EXPORT_BUCKET}'
      }
    },
    getLocation: {
      handler: 'src/stacks/mcall/getLocation.handler',
      memorySize: 128,
      timeout: 5,
      events: [
        {
          http: {
            method: 'get',
            path: '/',
            cors: true
          }
        }
      ]
    }
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    }
  }
}

module.exports = serverlessConfiguration
