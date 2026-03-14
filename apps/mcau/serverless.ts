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
  service: "mcau",

  provider: {
    ...baseServerlessConfiguration.provider!,
    region: "ap-southeast-2",
    deploymentBucket: {
      name: getServiceDeploymentBucket(
        "mcau",
        stage,
        process.env.MCAU_DEPLOYMENT_BUCKET,
      ),
    },
  },

  functions: {
    getAllStores: {
      memorySize: 512,
      timeout: 900,
      handler: "src/getAllStores/index.handler",
      events: [
        {
          schedule: {
            rate: ["cron(05 1 ? * SUN *)"],
            input: { countries: ["AU2"] },
          },
        },
        {
          schedule: {
            rate: ["cron(05 2 ? * SUN *)"],
            input: { countries: ["AU"] },
          },
        },
      ],
      environment: {
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
        BASIC_TOKEN_AP: getRequiredEnv("BASIC_TOKEN_AP"),
      },
    },
    getItemStatus: {
      memorySize: 368,
      timeout: 900,
      handler: "src/getItemStatus/index.handler",
      events: [
        {
          schedule: "cron(0 * * * ? *)",
        },
      ],
      environment: {
        BASIC_TOKEN_AP: getRequiredEnv("BASIC_TOKEN_AP"),
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
      },
    },
  },
};

module.exports = serverlessConfiguration;
