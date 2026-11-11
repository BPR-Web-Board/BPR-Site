import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wp-content/:path*",
        destination: "https://cms.brownpoliticalreview.org/wp-content/:path*",
        permanent: true,
      },
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
    unoptimized: true,
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
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
