/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/assets/:path',
        destination: `https://mcbrokenio-export-geojson-dev.s3.eu-central-1.amazonaws.com/:path`, // Proxy to S3
      },
      {
        source: '/ip',
        destination:
          'https://tzxepx63zf.execute-api.eu-central-1.amazonaws.com/dev/',
      },
    ];
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});
