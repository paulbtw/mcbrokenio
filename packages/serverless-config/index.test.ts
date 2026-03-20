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

afterEach(() => {
  process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  process.env.SENTRY_DSN = ORIGINAL_SENTRY_DSN;
});

describe("getDeploymentStage", () => {
  it("always returns dev", () => {
    // These env vars are intentionally ignored by getDeploymentStage.
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.SLS_STAGE = "production";
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.STAGE = "staging";

    expect(getDeploymentStage()).toBe("dev");
  });
});

describe("bucket helpers", () => {
  it("builds dev bucket names", () => {
    expect(getStageBucketName("mcbrokenio-assets")).toBe(
      "mcbrokenio-assets-dev",
    );
    expect(getServiceDeploymentBucket("mcus")).toBe(
      "mcbrokenio-mcus-bucket-dev",
    );
    expect(getExportBucket()).toBe("mcbrokenio-export-geojson-dev");
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
