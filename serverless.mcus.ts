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
      handler: 'src/functions/getAllStores.handler',
      events: [
        {
          schedule: 'cron(35 0 ? * SUN *)'
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
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    }
  }
}

module.exports = serverlessConfiguration
