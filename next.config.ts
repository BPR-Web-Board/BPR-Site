import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wp-admin",
        destination: "https://cms.brownpoliticalreview.org/wp-admin/",
        permanent: false,
      },
      {
        source: "/wp-admin/:path*",
        destination: "https://cms.brownpoliticalreview.org/wp-admin/:path*",
        permanent: false,
      },
      {
        source: "/wp-login.php",
        destination: "https://cms.brownpoliticalreview.org/wp-login.php",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      {
        protocol: "https",
        hostname: "brownpoliticalreview.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.brownpoliticalreview.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.brownpoliticalreview.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.builder.io",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
