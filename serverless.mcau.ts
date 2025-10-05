/* eslint-disable @typescript-eslint/no-restricted-imports */
import type { AWS } from '@serverless/typescript'
import { baseServerlessConfiguration } from './serverless.base'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcau',

  provider: {
    ...baseServerlessConfiguration.provider,
    name: 'aws',
    region: 'ap-southeast-2',
    deploymentBucket: { name: "mcbrokenio-mcau-bucket-${opt:stage, 'dev'}" }
  },

  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: 'src/stacks/mcau/getAllStores.handler',
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
      handler: 'src/stacks/mcau/getItemStatus.handler',
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
