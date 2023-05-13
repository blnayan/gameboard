/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
