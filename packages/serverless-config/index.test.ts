import { afterEach, describe, expect, it } from "vitest";

import {
  getDeploymentStage,
  getExportBucket,
  getOptionalEnv,
  getRequiredEnv,
  getServiceDeploymentBucket,
  getStageBucketName,
} from "./index";

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;
const ORIGINAL_SENTRY_DSN = process.env.SENTRY_DSN;
const ORIGINAL_SLS_STAGE = process.env.SLS_STAGE;
const ORIGINAL_STAGE = process.env.STAGE;

afterEach(() => {
  process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  process.env.SENTRY_DSN = ORIGINAL_SENTRY_DSN;
  process.env.SLS_STAGE = ORIGINAL_SLS_STAGE;
  process.env.STAGE = ORIGINAL_STAGE;
});

describe("getDeploymentStage", () => {
  it("prefers SLS_STAGE when provided", () => {
    process.env.SLS_STAGE = "production";
    process.env.STAGE = "staging";

    expect(getDeploymentStage()).toBe("production");
  });

  it("falls back to STAGE when SLS_STAGE is missing", () => {
    delete process.env.SLS_STAGE;
    process.env.STAGE = "staging";

    expect(getDeploymentStage()).toBe("staging");
  });

  it("defaults to dev when no stage env vars are present", () => {
    delete process.env.SLS_STAGE;
    delete process.env.STAGE;

    expect(getDeploymentStage()).toBe("dev");
  });
});

describe("bucket helpers", () => {
  it("builds stage-specific non-deployment bucket names", () => {
    process.env.SLS_STAGE = "production";

    expect(getStageBucketName("mcbrokenio-assets")).toBe(
      "mcbrokenio-assets-production",
    );
    expect(getExportBucket()).toBe("mcbrokenio-export-geojson-production");
  });

  it("keeps deployment buckets on the shared dev bucket name", () => {
    process.env.SLS_STAGE = "production";

    expect(getServiceDeploymentBucket("mcus")).toBe(
      "mcbrokenio-mcus-bucket-dev",
    );
  });

  it("uses explicit overrides when provided", () => {
    expect(getServiceDeploymentBucket("mcall", "custom-bucket")).toBe(
      "custom-bucket",
    );
    expect(getExportBucket("exports-bucket")).toBe("exports-bucket");
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

describe("getOptionalEnv", () => {
  it("returns the trimmed local env value when available", () => {
    process.env.SENTRY_DSN = "  https://example.com/123  ";

    expect(getOptionalEnv("SENTRY_DSN")).toBe("https://example.com/123");
  });

  it("returns undefined when the env is missing", () => {
    delete process.env.SENTRY_DSN;

    expect(getOptionalEnv("SENTRY_DSN")).toBeUndefined();
  });
});
