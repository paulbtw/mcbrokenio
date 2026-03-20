import {
  baseServerlessConfiguration,
  getDeploymentStage,
  getExportBucket,
  getRequiredEnv,
  getServiceDeploymentBucket,
} from "@mcbroken/serverless-config";
import type { AWS } from "@serverless/typescript";

const stage = getDeploymentStage();
const exportBucket = getExportBucket(process.env.EXPORT_BUCKET);

const serverlessConfiguration: AWS = {
  ...baseServerlessConfiguration,
  service: "mcall",

  provider: {
    ...baseServerlessConfiguration.provider!,
    region: "eu-central-1",
    deploymentBucket: {
      name: getServiceDeploymentBucket(
        "mcall",
        stage,
        process.env.MCALL_DEPLOYMENT_BUCKET,
      ),
    },
    environment: {
      ...baseServerlessConfiguration.provider!.environment,
      EXPORT_BUCKET: exportBucket,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:PutObject", "s3:PutObjectAcl", "s3:GetObject"],
            Resource: [
              `arn:aws:s3:::${exportBucket}`,
              `arn:aws:s3:::${exportBucket}/*`,
            ],
          },
        ],
      },
    },
  },

  functions: {
    getAllStores: {
      memorySize: 368,
      timeout: 900,
      handler: "src/getAllStores/index.handler",
      events: [
        {
          schedule: "cron(05 0 ? * SUN *)",
        },
      ],
      environment: {
        BASIC_TOKEN_EU: getRequiredEnv("BASIC_TOKEN_EU"),
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
        KEY: getRequiredEnv("KEY"),
      },
    },
    getItemStatusEu: {
      memorySize: 368,
      timeout: 900,
      handler: "src/getItemStatus/index.handlerEu",
      events: [
        {
          schedule: "cron(5 * * * ? *)",
        },
      ],
      environment: {
        BASIC_TOKEN_EU: getRequiredEnv("BASIC_TOKEN_EU"),
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
      },
    },
    getItemStatusEl: {
      memorySize: 368,
      timeout: 900,
      handler: "src/getItemStatus/index.handlerEl",
      events: [
        {
          schedule: "cron(20 * * * ? *)",
        },
      ],
      environment: {
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
        KEY: getRequiredEnv("KEY"),
        BASIC_TOKEN_EL: getRequiredEnv("BASIC_TOKEN_EL"),
      },
    },
    createJson: {
      memorySize: 368,
      timeout: 60,
      handler: "src/createJson/index.handler",
      events: [
        {
          schedule: "cron(0/15 * * * ? *)",
        },
      ],
      environment: {
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
        EXPORT_BUCKET: exportBucket,
      },
    },
  },
};

module.exports = serverlessConfiguration;
