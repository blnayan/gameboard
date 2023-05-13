/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: process.env.GITHUB ? true : undefined,
  basePath: process.env.GITHUB ? "/gameboard" : undefined,
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
