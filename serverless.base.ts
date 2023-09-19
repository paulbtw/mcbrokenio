import type { AWS } from '@serverless/typescript'

export const baseServerlessConfiguration: Partial<AWS> = {
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dotenv-plugin', 'serverless-offline'],
  useDotenv: true,

  package: {
    individually: true,
    patterns: [
      'node_modules/.prisma/client/schema.prisma',
      'node_modules/.prisma/client/libquery_engine-*',
      'node_modules/.prisma/client/libquery_engine-rhel-*',
      'node_modules/prisma/libquery_engine-*',
      'node_modules/@prisma/engines/**'
    ]
  },

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    memorySize: 128,
    apiGateway: {
      minimumCompressionSize: 1024
    },
    stage: "${opt:stage, 'dev'}",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
    },
    architecture: 'x86_64'
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
