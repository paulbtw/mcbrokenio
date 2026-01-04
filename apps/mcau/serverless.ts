/* eslint-disable @typescript-eslint/no-restricted-imports */
import { baseServerlessConfiguration } from '@mcbroken/serverless-config'
import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcau',

  provider: {
    ...baseServerlessConfiguration.provider!,
    name: 'aws',
    region: 'ap-southeast-2',
    deploymentBucket: { name: "mcbrokenio-mcau-bucket-dev" },
    environment: {
      PRISMA_QUERY_ENGINE_LIBRARY: '/var/task/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'
    },
  },

  package: {
    individually: true,
    patterns: [
      'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
      'node_modules/.prisma/client/schema.prisma',
      '!node_modules/prisma/libquery_engine-*',
      '!node_modules/@prisma/engines/**'
    ]
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

