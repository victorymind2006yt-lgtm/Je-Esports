/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "anyimage.io",
      },
    ],
  },
};

module.exports = nextConfig;
