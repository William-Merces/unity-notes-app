/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];  // Fix for canvas dependency
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  }
  // Removemos apenas o experimental.serverActions pois não é mais necessário
};

module.exports = nextConfig;