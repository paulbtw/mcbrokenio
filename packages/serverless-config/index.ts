import type { AWS } from "@serverless/typescript";

const DEFAULT_STAGE = "dev";

function getTrimmedValue(value?: string): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function getDeploymentStage(): string {
  return (
    getTrimmedValue(process.env.SLS_STAGE) ??
    getTrimmedValue(process.env.STAGE) ??
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
  override?: string,
): string {
  return getTrimmedValue(override) ?? `${prefix}-${getDeploymentStage()}`;
}

export function getServiceDeploymentBucket(
  service: string,
  override?: string,
): string {
  return getTrimmedValue(override) ?? `mcbrokenio-${service}-bucket-${DEFAULT_STAGE}`;
}

export function getExportBucket(override?: string): string {
  return (
    getTrimmedValue(override) ??
    `mcbrokenio-export-geojson-${getDeploymentStage()}`
  );
}

export const baseServerlessConfiguration: Partial<AWS> = {
  frameworkVersion: "4",
  plugins: ["serverless-offline"],
  useDotenv: true,

  build: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      external: ["aws-sdk"],
      target: "node24",
      platform: "node",
      buildConcurrency: 10,
    },
  },

  package: {
    individually: true,
  },

  provider: {
    name: "aws",
    runtime: "nodejs24.x",
    memorySize: 128,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    stage: getDeploymentStage(),
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      LOG_LEVEL: "NONE",
      SENTRY_ENVIRONMENT:
        getOptionalEnv("SENTRY_ENVIRONMENT") ?? getDeploymentStage(),
      ...(getOptionalEnv("SENTRY_DSN")
        ? { SENTRY_DSN: getOptionalEnv("SENTRY_DSN") }
        : {}),
    },
    architecture: "x86_64",
  },
};
