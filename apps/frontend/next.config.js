const exportBucket =
  process.env.EXPORT_BUCKET ?? "mcbrokenio-export-geojson-dev";
const assetsOrigin =
  process.env.MCBROKEN_ASSETS_ORIGIN ??
  `https://${exportBucket}.s3.eu-central-1.amazonaws.com`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: `${assetsOrigin}/:path*`,
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(nextConfig);
