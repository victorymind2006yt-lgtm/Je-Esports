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

// updated logo config
module.exports = nextConfig;
