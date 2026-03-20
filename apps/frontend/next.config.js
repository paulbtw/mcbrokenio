const DEFAULT_ASSETS_ORIGIN =
  "https://mcbrokenio-export-geojson-dev.s3.eu-central-1.amazonaws.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const assetsOrigin =
      process.env.MCBROKEN_ASSETS_ORIGIN?.replace(/\/$/, "") ??
      DEFAULT_ASSETS_ORIGIN;

    return [
      {
        source: "/marker.json",
        destination: `${assetsOrigin}/marker.json`,
      },
      {
        source: "/stats.json",
        destination: `${assetsOrigin}/stats.json`,
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(nextConfig);
