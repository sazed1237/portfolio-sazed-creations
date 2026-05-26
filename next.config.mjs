/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgbb.com",
      },
      {
        protocol: "https",
        hostname: "i.imgbb.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
