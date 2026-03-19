import {
  baseServerlessConfiguration,
  getDeploymentStage,
  getRequiredEnv,
  getServiceDeploymentBucket,
} from "@mcbroken/serverless-config";
import type { AWS } from "@serverless/typescript";

const stage = getDeploymentStage();

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
  },
};

module.exports = serverlessConfiguration;
