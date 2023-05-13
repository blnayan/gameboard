/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: process.env.GITHUB ? "/gameboard" : undefined,
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
