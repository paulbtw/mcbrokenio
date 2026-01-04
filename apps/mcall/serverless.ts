import { baseServerlessConfiguration } from '@mcbroken/serverless-config'
import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: 'mcall',

  provider: {
    ...baseServerlessConfiguration.provider!,
    region: 'eu-central-1',
    deploymentBucket: { name: "mcbrokenio-mcall-bucket-dev" },
    environment: {
      ...baseServerlessConfiguration.provider!.environment,
      EXPORT_BUCKET: process.env.EXPORT_BUCKET || '${env:EXPORT_BUCKET}'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject', 's3:PutObjectAcl', 's3:GetObject'],
            Resource: [
              'arn:aws:s3:::${env:EXPORT_BUCKET}',
              'arn:aws:s3:::${env:EXPORT_BUCKET}/*'
            ]
          }
        ]
      }
    }
  },

  functions: {
    getAllStores: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/getAllStores/index.handler',
      events: [
        {
          schedule: 'cron(05 0 ? * SUN *)'
        }
      ],
      environment: {
        BASIC_TOKEN_EU: process.env.BASIC_TOKEN_EU || '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: process.env.DATABASE_URL || '${env:DATABASE_URL}',
        KEY: process.env.KEY || '${env:KEY}'
      }
    },
    getItemStatusEu: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/getItemStatus/index.handlerEu',
      events: [
        {
          schedule: 'cron(5 * * * ? *)'
        }
      ],
      environment: {
        BASIC_TOKEN_EU: process.env.BASIC_TOKEN_EU || '${env:BASIC_TOKEN_EU}',
        DATABASE_URL: process.env.DATABASE_URL || '${env:DATABASE_URL}'
      }
    },
    getItemStatusEl: {
      memorySize: 368,
      timeout: 900,
      handler: 'src/getItemStatus/index.handlerEl',
      events: [
        {
          schedule: 'cron(20 * * * ? *)'
        }
      ],
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || '${env:DATABASE_URL}',
        KEY: process.env.KEY || '${env:KEY}',
        BASIC_TOKEN_EL: process.env.BASIC_TOKEN_EL || '${env:BASIC_TOKEN_EL}'
      }
    },
    createJson: {
      memorySize: 368,
      timeout: 60,
      handler: 'src/createJson/index.handler',
      events: [
        {
          schedule: 'cron(0/15 * * * ? *)'
        }
      ],
      environment: {
        DATABASE_URL: process.env.DATABASE_URL || '${env:DATABASE_URL}',
        EXPORT_BUCKET: process.env.EXPORT_BUCKET || '${env:EXPORT_BUCKET}'
      }
    }
  }
}

module.exports = serverlessConfiguration

