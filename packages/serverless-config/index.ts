import type { AWS } from "@serverless/typescript";

const DEFAULT_STAGE = "dev";

function getCliStage(cliArgs: string[]): string | undefined {
  const inlineStage = cliArgs.find(
    (arg) => arg.startsWith("--stage=") || arg.startsWith("-s="),
  );

  if (inlineStage) {
    return inlineStage.split("=")[1];
  }

  const stageFlagIndex = cliArgs.findIndex(
    (arg) => arg === "--stage" || arg === "-s",
  );

  if (stageFlagIndex === -1) {
    return undefined;
  }

  return cliArgs[stageFlagIndex + 1];
}

function getTrimmedValue(value?: string): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function getDeploymentStage(cliArgs: string[] = process.argv): string {
  return (
    getTrimmedValue(process.env.SLS_STAGE) ??
    getTrimmedValue(process.env.STAGE) ??
    getTrimmedValue(getCliStage(cliArgs)) ??
    DEFAULT_STAGE
  );
}

export function getRequiredEnv(name: string): string {
  return getTrimmedValue(process.env[name]) ?? `\${env:${name}}`;
}

export function getOptionalEnv(name: string): string | undefined {
  return getTrimmedValue(process.env[name]);
}

export function getStageBucketName(
  prefix: string,
  stage: string = getDeploymentStage(),
  override?: string,
): string {
  return getTrimmedValue(override) ?? `${prefix}-${stage}`;
}

export function getServiceDeploymentBucket(
  service: string,
  stage: string = getDeploymentStage(),
  override?: string,
): string {
  return getStageBucketName(`mcbrokenio-${service}-bucket`, stage, override);
}

export function getExportBucket(override?: string): string {
  return getTrimmedValue(override) ?? "mcbrokenio-export-geojson-dev";
}

export const baseServerlessConfiguration: Partial<AWS> = {
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
  useDotenv: true,

  package: {
    individually: true,
    patterns: [
      "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
      "node_modules/.prisma/client/schema.prisma",
      "!node_modules/prisma/libquery_engine-*",
      "!node_modules/@prisma/engines/**",
    ],
  },

  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    memorySize: 128,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    stage: getDeploymentStage(),
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      LOG_LEVEL: "NONE",
      PRISMA_QUERY_ENGINE_LIBRARY:
        "/var/task/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
      SENTRY_ENVIRONMENT:
        getOptionalEnv("SENTRY_ENVIRONMENT") ?? getDeploymentStage(),
      ...(getOptionalEnv("SENTRY_DSN")
        ? { SENTRY_DSN: getOptionalEnv("SENTRY_DSN") }
        : {}),
    },
    architecture: "x86_64",
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};
