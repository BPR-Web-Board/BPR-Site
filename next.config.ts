/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["brownpoliticalreview.org"],
  },
  webpack(config) {
    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
};

module.exports = nextConfig;