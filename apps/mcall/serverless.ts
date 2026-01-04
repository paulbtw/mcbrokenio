import type { AWS } from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  useDotenv: true,
  service: 'mcall',

  package: {
    individually: true,
    patterns: [
      'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
      'node_modules/.prisma/client/schema.prisma',
      '!node_modules/prisma/libquery_engine-*',
      '!node_modules/@prisma/engines/**'
    ]
  },

  provider: {
    name: 'aws',
    region: 'eu-central-1',
    runtime: 'nodejs20.x',
    apiGateway: {
      minimumCompressionSize: 1024
    },
    stage: "${opt:stage, 'dev'}",
    architecture: 'x86_64',
    deploymentBucket: { name: "mcbrokenio-mcall-bucket-dev" },
    environment: {
      PRISMA_QUERY_ENGINE_LIBRARY: '/var/task/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
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
    },
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

