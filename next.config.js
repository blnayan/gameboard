/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: "/gameboard",
  assetPrefix: "/gameboard/",
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
