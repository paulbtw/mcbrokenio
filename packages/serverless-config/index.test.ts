import { afterEach, describe, expect, it } from "vitest";

import {
  getDeploymentStage,
  getExportBucket,
  getRequiredEnv,
  getServiceDeploymentBucket,
  getStageBucketName,
} from "./index";

const ORIGINAL_SLS_STAGE = process.env.SLS_STAGE;
const ORIGINAL_STAGE = process.env.STAGE;
const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

afterEach(() => {
  process.env.SLS_STAGE = ORIGINAL_SLS_STAGE;
  process.env.STAGE = ORIGINAL_STAGE;
  process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
});

describe("getDeploymentStage", () => {
  it("prefers SLS_STAGE when present", () => {
    process.env.SLS_STAGE = "production";
    process.env.STAGE = "staging";

    expect(getDeploymentStage(["serverless", "deploy", "--stage", "dev"])).toBe(
      "production",
    );
  });

  it("falls back to STAGE before CLI args", () => {
    delete process.env.SLS_STAGE;
    process.env.STAGE = "staging";

    expect(
      getDeploymentStage(["serverless", "deploy", "--stage", "production"]),
    ).toBe("staging");
  });

  it("reads the stage from a separated CLI flag", () => {
    delete process.env.SLS_STAGE;
    delete process.env.STAGE;

    expect(
      getDeploymentStage(["serverless", "deploy", "--stage", "production"]),
    ).toBe("production");
  });

  it("reads the stage from an inline CLI flag", () => {
    delete process.env.SLS_STAGE;
    delete process.env.STAGE;

    expect(
      getDeploymentStage(["serverless", "deploy", "--stage=staging"]),
    ).toBe("staging");
  });

  it("defaults to dev when no stage is provided", () => {
    delete process.env.SLS_STAGE;
    delete process.env.STAGE;

    expect(getDeploymentStage(["serverless", "deploy"])).toBe("dev");
  });
});

describe("bucket helpers", () => {
  it("builds stage-based bucket names", () => {
    expect(getStageBucketName("mcbrokenio-assets", "staging")).toBe(
      "mcbrokenio-assets-staging",
    );
    expect(getServiceDeploymentBucket("mcus", "production")).toBe(
      "mcbrokenio-mcus-bucket-production",
    );
    expect(getExportBucket("dev")).toBe("mcbrokenio-export-geojson-dev");
  });

  it("uses explicit overrides when provided", () => {
    expect(
      getServiceDeploymentBucket("mcall", "production", "custom-bucket"),
    ).toBe("custom-bucket");
    expect(getExportBucket("staging", "exports-bucket")).toBe("exports-bucket");
  });
});

describe("getRequiredEnv", () => {
  it("returns the local env value when available", () => {
    process.env.DATABASE_URL = "postgres://local";

    expect(getRequiredEnv("DATABASE_URL")).toBe("postgres://local");
  });

  it("returns a Serverless env placeholder when missing", () => {
    delete process.env.DATABASE_URL;

    expect(getRequiredEnv("DATABASE_URL")).toBe("${env:DATABASE_URL}");
  });
});
